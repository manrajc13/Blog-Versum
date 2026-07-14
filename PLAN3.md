# Redis Caching Layer + Dockerized EC2 Deployment

## Goal

Introduce Redis as a shared, cache-aside layer in front of the three feed endpoints
(`getFollowingFeed`, `getRecommendedFeed`, `getTrendingFeed` in `feed.controller.js`),
and package the backend (Express server + Redis) as two Docker containers deployed
together on a single EC2 instance via Docker Compose.

The cache is deliberately built as **shared/distributed infrastructure** (Redis)
rather than an in-process LRU, even though only one EC2 instance exists today. The
code written in this phase should require zero changes on the day a second instance
is added — only the Socket.IO adapter piece (explicitly out of scope below) would
need to be added at that point.

---

# Why Redis Here, Specifically

`getTrendingFeed` and `getRecommendedFeed` recompute an engagement score
(`likes * 2 + comments * 3` divided by post age) over Mongo query results on every
single request, with no memoization. `trending.model.js` exists in the schema layer
but is never written to. This is the confirmed hot path and the target of this phase.

`getFollowingFeed` is cheaper (a `Follow` lookup + a sorted `Post` query, no scoring)
but is included for consistency and because follower-feed staleness tolerance is
still non-zero (a few seconds is fine).

---

# Out of Scope

Do **not**:

- Implement the Socket.IO Redis adapter or move `userSocketMap` (in `lib/socket.js`)
  into Redis. That is a multi-instance correctness fix, not a caching concern, and
  is irrelevant on a single EC2 instance. Future work only.
- Touch `message.controller.js`. The O(n) scans there (`getMessages`,
  `getUsersForSidebar`, `getUsersToChatWith`) are a missing-index problem, not a
  caching problem, and are a separate fix.
- Add client-side caching (e.g. TanStack Query) to the Zustand stores. Later phase,
  additive on top of this one.
- Add event-driven cache invalidation (busting a specific key when a post/like/
  comment/follow mutation happens). This phase is TTL-only by design — see
  "Invalidation Strategy" below for the reasoning.
- Set up a container registry (ECR) or CI/CD pipeline. Deployment is a manual
  `git pull` + `docker compose up -d --build` on the EC2 box.
- Change instance count, load balancer, or anything implying more than one EC2
  instance.

---

# Part 1 — Code Changes

## 1.1 Dependency

Add to `server/package.json` dependencies:

```
"ioredis": "^5.4.1"
```

## 1.2 New file: `server/src/lib/redis.js`

A singleton `ioredis` client, connected once at module load and reused everywhere
(never construct a new client per request).

Responsibilities:

- Read connection string from `process.env.REDIS_URL`.
- Attach `on("error", ...)` and `on("connect", ...)` listeners that log, never throw.
  A Redis outage must never crash the process — see 1.3.
- Export the client as the default export.

```js
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 2,
  retryStrategy: (times) => Math.min(times * 200, 2000),
});

redis.on("connect", () => console.log("[redis] connected"));
redis.on("error", (err) => console.error("[redis] error:", err.message));

export default redis;
```

## 1.3 New file: `server/src/lib/cache.js`

Implements the cache-aside pattern discussed in the design conversation, plus a
lock-guarded variant for the one key that's genuinely at stampede risk (the global
trending key — a single key hit by every logged-in user).

Two exports:

**`getOrSetCache(key, ttlSeconds, computeFn)`** — used for `feed:recommended:<userId>`
and `feed:following:<userId>`. Per-user keys naturally spread load across many keys,
so a simple cache-aside read/compute/write is sufficient:

```js
import redis from "./redis.js";

export async function getOrSetCache(key, ttlSeconds, computeFn) {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    console.error(`[cache] GET failed for ${key}:`, err.message);
  }

  const data = await computeFn();

  try {
    await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
  } catch (err) {
    console.error(`[cache] SET failed for ${key}:`, err.message);
  }

  return data;
}
```

Note the shape: a Redis failure on either GET or SET is caught and logged, never
propagated. Worst case on a Redis outage is "every request recomputes from Mongo,"
i.e. the app degrades to pre-caching behavior — it must never 500 because Redis is
down.

**`getOrSetCacheWithLock(key, ttlSeconds, computeFn)`** — used only for
`feed:trending:global`. Guards against the thundering-herd case: many concurrent
requests missing the same expired key at once and all recomputing simultaneously.

```js
import redis from "./redis.js";

export async function getOrSetCacheWithLock(key, ttlSeconds, computeFn) {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    console.error(`[cache] GET failed for ${key}:`, err.message);
  }

  const lockKey = `lock:${key}`;
  let gotLock = false;
  try {
    const lock = await redis.set(lockKey, "1", "NX", "PX", 5000);
    gotLock = lock === "OK";
  } catch (err) {
    console.error(`[cache] LOCK failed for ${key}:`, err.message);
  }

  if (!gotLock) {
    // another request is already recomputing — briefly wait, then try the read once more
    await new Promise((resolve) => setTimeout(resolve, 150));
    try {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);
    } catch (_) {
      // fall through to computing directly below
    }
  }

  const data = await computeFn();

  try {
    await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
    if (gotLock) await redis.del(lockKey);
  } catch (err) {
    console.error(`[cache] SET failed for ${key}:`, err.message);
  }

  return data;
}
```

If the wait-and-retry still misses (lock holder hasn't finished yet), this function
computes anyway rather than blocking indefinitely — a duplicate compute under heavy
contention is acceptable; an indefinite hang is not.

## 1.4 Modify `server/src/controllers/feed.controller.js`

Wrap the existing Mongo-query-and-format logic of each handler in the cache helpers.
The controllers keep their existing `try/catch` for the HTTP response — cache
failures are already swallowed inside `lib/cache.js`, so a 500 here means a genuine
Mongo/logic failure, same as today.

- `getTrendingFeed`: extract the existing body (the `Post.find` + ranking + author
  lookups + response-shape building) into an inner async function, call it via
  `getOrSetCacheWithLock("feed:trending:global", 180, computeFn)`. Key is global —
  not per-user — because trending is the same for everyone.
- `getRecommendedFeed`: same extraction, call via
  `getOrSetCache(\`feed:recommended:${userId}\`, 90, computeFn)`.
- `getFollowingFeed`: same extraction, call via
  `getOrSetCache(\`feed:following:${userId}\`, 20, computeFn)`.

TTLs are defined as constants at the top of `feed.controller.js`
(`TRENDING_TTL_SECONDS = 180`, `RECOMMENDED_TTL_SECONDS = 90`,
`FOLLOWING_TTL_SECONDS = 20`) rather than environment variables — these are tuning
values, not deployment secrets, and hardcoding them keeps this phase's diff focused.

## 1.5 Environment variables

Add to `server/.env.example` and `server/.env`:

```
# --- Redis (feed caching) --------------------------------------------------
# In Docker Compose, this resolves to the `redis` service on the shared network.
# For local dev without Docker, point at a local Redis instance instead
# (e.g. redis://localhost:6379).
REDIS_URL=redis://redis:6379
```

## 1.6 Graceful shutdown in `server/src/index.js`

Docker sends `SIGTERM` on `docker stop` / `docker compose down` and waits a grace
period before `SIGKILL`. Add a handler so the container exits cleanly instead of
being force-killed on every deploy:

```js
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => process.exit(0));
});
```

(`server` here is the existing `http.Server` imported from `lib/socket.js`, already
in scope in `index.js`.)

---

# Part 2 — Dockerizing the Server

## 2.1 New file: `server/Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

EXPOSE 5001

CMD ["node", "src/index.js"]
```

## 2.2 New file: `server/.dockerignore`

```
node_modules
npm-debug.log
.env
.env.example
```

## 2.3 New file: `docker-compose.yml` (repo root)

```yaml
services:
  app:
    build: ./server
    env_file:
      - ./server/.env
    ports:
      - "5001:5001"
    depends_on:
      redis:
        condition: service_healthy
    restart: unless-stopped
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru --save ""
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    restart: unless-stopped
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

Notes matching the earlier design discussion:

- `redis` has no `ports:` entry — it is reachable only at `redis:6379` from inside
  the Compose network, never from the host or the internet. No EC2 security group
  rule for 6379 is needed or should be added.
- `--save ""` disables RDB persistence. Everything cached here is derived from
  MongoDB Atlas; losing the cache on a restart is a cold-start (see stampede
  handling above), not data loss.
- `depends_on: condition: service_healthy` ensures the app container doesn't start
  hitting Redis before Redis is actually accepting connections.

---

# Part 3 — EC2 Deployment Instructions

## 3.1 Launch the instance

- AMI: Amazon Linux 2023.
- Instance type: `t3.small` minimum, `t3.medium` recommended (Node + Redis + Docker
  daemon overhead; MongoDB is off-box on Atlas so this box only needs to share
  resources between two containers).
- Security group inbound rules: **22 (SSH)** and **5001 (app)** only. Nothing for
  Redis — it's never exposed outside the Docker network.

## 3.2 Install Docker

SSH into the instance, then:

```bash
sudo dnf update -y
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
# log out and back in for the group change to apply
```

Install the Compose plugin:

```bash
mkdir -p ~/.docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose
docker compose version
```

## 3.3 Get the code onto the instance

```bash
git clone <repo-url>
cd blog-versum
```

## 3.4 Configure environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and fill in real values for `MONGODB_URI` (Atlas connection
string), `JWT_SECRET`, Cloudinary keys, `CLIENT_URL`, email credentials, and
`INTERNAL_API_KEY`. Set:

```
REDIS_URL=redis://redis:6379
PORT=5001
NODE_ENV=production
```

## 3.5 Build and start

```bash
docker compose build
docker compose up -d
```

## 3.6 Verify

```bash
docker compose ps                     # both services "healthy"/"running"
docker compose logs -f app            # confirm "[redis] connected" and server boot log
curl http://localhost:5001/api/auth/check   # sanity check the app is answering
```

Confirm caching is actually active:

```bash
docker exec -it $(docker compose ps -q redis) redis-cli ping   # PONG

# in one terminal, watch Redis activity:
docker exec -it $(docker compose ps -q redis) redis-cli monitor

# in another terminal, hit the trending endpoint twice (with a valid session cookie):
curl -b cookies.txt http://localhost:5001/api/feed/trending
curl -b cookies.txt http://localhost:5001/api/feed/trending
```

Expect: the first call shows a Mongo round-trip and a Redis `SET`; the second call
(within the 180s TTL) shows only a Redis `GET`, no recomputation.

---

# Part 4 — Validation Checklist

- [ ] Cold call to `/api/feed/trending` → cache miss, Mongo queried, `SET` observed
      in `redis-cli monitor`.
- [ ] Second call within TTL → cache hit, no Mongo query.
- [ ] Wait past the TTL, call again → miss again, cache refreshed.
- [ ] Fire several concurrent requests right as the trending key expires (e.g. a
      quick loop of parallel `curl`s) → only one Mongo compute observed, confirming
      the lock in `getOrSetCacheWithLock` is working.
- [ ] `docker compose stop redis`, hit any feed endpoint → still returns `200`
      (degraded, computed directly from Mongo), not `500`. Confirms the fallback
      path in `lib/cache.js` actually works, not just in theory.
- [ ] `docker compose start redis`, confirm caching resumes without restarting the
      app container.
- [ ] `docker compose restart app` → Redis cache stays warm (only the app
      container restarted, cached keys untouched).
- [ ] Reboot the EC2 instance → both containers come back on their own via
      `restart: unless-stopped`; verify with `docker compose ps` after reboot.

---

# Invalidation Strategy (TTL-only, by design)

No cache key in this phase is proactively invalidated when a post/like/comment/
follow mutation happens. Feeds are already an approximate, rolling concept — the
existing engagement-score design tolerates staleness by nature. Wiring invalidation
into every write path (post create/delete, like, comment, follow) would couple
unrelated controllers to the feed cache and add real complexity for a benefit users
are unlikely to notice at TTLs this short (20s–180s). Revisit only if staleness
becomes a reported problem, not preemptively.

---

# Expected Outcome

After this phase:

- Trending, recommended, and following feeds are served from Redis on a cache hit,
  computed from Mongo (and written back to Redis) on a miss.
- A Redis outage degrades the app to pre-caching behavior instead of breaking it.
- The trending key (highest-traffic, global) is protected against thundering-herd
  recomputation.
- The server and Redis run as two containers on one EC2 instance via Docker
  Compose, with Redis unreachable from outside the Docker network.
- The caching code itself is already what a multi-instance deployment would use —
  adding a second EC2 instance later requires no changes here, only the
  (explicitly out-of-scope) Socket.IO Redis adapter work.

---

# Future Work (explicitly deferred, not part of this phase)

- Socket.IO Redis adapter + moving `userSocketMap` into Redis — only needed once a
  second server instance exists.
- Client-side caching (e.g. TanStack Query) layered on top of the now-cheaper feed
  endpoints.
- Fixing the `message.controller.js` O(n) scans via a compound Mongo index on
  `senderId`/`receiverId` — unrelated to caching, a query/indexing fix.
- Event-driven cache invalidation, if TTL-only staleness proves noticeable.
- Migrating from a self-hosted Redis container to a managed service (e.g.
  ElastiCache) if resource contention on the EC2 box becomes a real constraint.
