# BlogVerse — Deployment Plan (Containerized Frontend + Backend + Redis)

> Companion to `context.md`, `README.md`, and `PLAN3.md`. This document is the plan
> for wrapping up the frontend (`client/blog-versum/`) and backend (`server/`) into
> separate Docker containers, alongside the existing Redis container, behind a single
> public entry point.

---

## 0. Status as of 2026-07-25

**Code + Docker/nginx layer is implemented.** Infra/DNS/TLS steps are not — those
still require action on the actual EC2 box and are the only things left in §9.

| Area | Status |
|---|---|
| §2 `client/blog-versum/Dockerfile`, `nginx.conf`, `.dockerignore` | ✅ Done |
| Root `docker-compose.yml` (3 services, healthcheck-gated) | ✅ Done |
| §3 all code changes (cookie, socket CORS, `trust proxy`, axios/env, `.env` cleanup) | ✅ Done |
| §8.1–§8.4, §8.6, §8.8 (blockers + high items) | ✅ Done — see inline notes below |
| §8.5 internal endpoint rate zone | ✅ nginx zone done; key rotation still a deploy-time action |
| §8.7 Redis sizing | ✅ Set to `256mb` (t3.small assumption) |
| §8.9 minor cleanups | ✅ Done |
| TLS (§6), DNS, security group, actual EC2 deploy (§9 steps 3–7) | ❌ Not started — infra actions, not code |

Full hardening middleware (rate limiters, helmet, mongoSanitize, hpp, upload
guards, error handler) from `PLAN_SECURE_DEPLOYMENT_PREREQUISITES.md` §3 is also
in — see that doc's own status banner for specifics, including one real deviation
from its plan (Express 5 broke the naive `mongoSanitize()` wiring — fixed with a
custom wrapper, details there).

---

## 1. Decision

Move from the current split (frontend on Vercel, backend on EC2 + Docker) to a
**single EC2 instance running three containers**:

| Container | Publicly reachable? | Role |
|---|---|---|
| `client` | **Yes** — only this one | Serves the built React app; forwards `/api/*` and `/socket.io/*` requests to `app` internally |
| `app` | No | Express API + Socket.IO server (unchanged logic, no longer exposed) |
| `redis` | No | Cache layer (unchanged — already private today) |

Rejected alternatives:
- **One container for everything** (Express also serving the frontend build) — simpler,
  but welds frontend/backend together and isn't what we're doing here.
- **Keep frontend on Vercel, backend on EC2** (current state) — two deploy targets,
  cross-origin cookies/CORS friction. Being replaced by this plan.

Why this shape: backend and Redis stay private (smaller attack surface, matches how
Redis is already configured), while the browser only ever sees one address — no more
cross-origin CORS/cookie handling between two different hosts.

---

## 2. Files to add — ✅ DONE

### `client/blog-versum/Dockerfile` — ✅ created
Multi-stage build:
1. `node:20-alpine` — install deps, `npm run build` (Vite), with `VITE_API_URL`
   passed in as a build arg (relative `/api`, not an absolute URL — see §3).
2. `nginx:1.27-alpine` — copy the built `dist/` output in, copy in the config below,
   serve on port 80.

### `client/blog-versum/nginx.conf` — ✅ created
The "receptionist" config for the `client` container. Implemented as a **full
`nginx.conf`** (with `events {}` / `http {}` blocks) that replaces
`/etc/nginx/nginx.conf` entirely — not a `conf.d/default.conf` fragment — because
the rate-limit zones and bot-blocking `map` from the prereqs doc (§5) must live at
the `http` level. Validated with `nginx -t` against the real `nginx:1.27-alpine`
image.

- `/api/auth/`, `/api/internal/`, `/api/` → forwarded to the matching
  `http://app:5001/...` path (the `app` name resolves via Docker's internal DNS),
  each behind its own `limit_req` zone per the prereqs doc §5.1.
- `/socket.io/` → forwarded to `http://app:5001/socket.io/`, with `Upgrade` /
  `Connection` headers passed through via a `map $http_upgrade $connection_upgrade`
  helper (standard nginx WebSocket idiom — needed so non-upgrade requests on the
  same location don't get a hardcoded `Connection: upgrade`) and
  `proxy_read_timeout 86400` for long-lived connections. Not rate-limited.
- Everything else → `try_files $uri $uri/ /index.html`, i.e. hand back `index.html`
  for any path that isn't a real static file, so React Router 7's client-side routing
  keeps working (replaces what `vercel.json`'s rewrite rule does today).
- Hashed static assets (`.js`/`.css`/images/fonts) get long cache lifetimes;
  `index.html` itself is not cached, since that's what changes on every deploy.
- Also includes: `include /etc/nginx/mime.types` (required once you own the whole
  `nginx.conf` — otherwise JS/CSS serve as `application/octet-stream` and the
  browser refuses to execute the module scripts), bot/UA blocklist, `robots.txt`,
  dotfile deny, method allowlist, and the security headers — all per the prereqs
  doc §5/§6, with CSP shipped as `Content-Security-Policy-Report-Only` (not yet
  enforcing, per that doc's own recommendation).

### Root `docker-compose.yml` (replaces the current one) — ✅ done
- **`client`**: builds from `client/blog-versum/`, is the *only* service with a
  `ports:` mapping (`80:80`), depends on `app` with `condition: service_healthy`
  (the §8.4 refinement below, applied directly rather than as a later fix).
- **`app`**: builds from `server/` (unchanged Dockerfile), **no `ports:` entry
  anymore** — reachable only inside the Compose network, depends on `redis`, has
  the `/api/health` healthcheck wired in.
- **`redis`**: `--save ""`, `--maxmemory 256mb --maxmemory-policy allkeys-lru`
  (lowered from 512mb per §8.7's `t3.small` sizing note), no `ports:`.
- No custom `networks:` block needed — Compose's default network already gives every
  service a DNS name matching its service name (`app`, `redis`, `client`).
- Validated with `docker compose config`.

---

## 3. Code changes required (existing files) — ✅ ALL DONE

| File | Change | Status |
|---|---|---|
| `client/blog-versum/src/lib/axios.js` | `baseURL` becomes relative: `import.meta.env.VITE_API_URL \|\| "/api"` instead of an absolute cross-origin URL | ✅ |
| Client Socket.IO connection call | Connect same-origin — `io()` with no URL argument, instead of the absolute backend URL | ✅ Already correct — `useAuthStore.js`'s `BASE_URL` was already `"/"` outside dev mode, no code change needed, just confirmed |
| `server/src/lib/socket.js` | Replace the hardcoded `cors: { origin: ["http://localhost:5173"] }` with `cors: { origin: process.env.CLIENT_URL \|\| "http://localhost:5173" }`, matching how `index.js` already reads `CLIENT_URL` for the main Express CORS setup | ✅ |
| `server/.env` | `CLIENT_URL` becomes just your one public domain (no more separate Vercel origin to allowlist) | ⏳ Deploy-time action on the box, not a code change |
| `client/blog-versum/.env` | Remove the absolute `VITE_API_URL` values (including the commented-out Render line) — the build now gets `/api` via the Docker build arg instead | ✅ |
| `client/blog-versum/vercel.json` | No longer used once cut over — safe to delete once confident in the new path, harmless to leave meanwhile | ⏳ Left in place, as planned |
| **`server/src/lib/utils/token.js`** | **BLOCKER — see §8.1.** Cookie is hardcoded `secure: true, sameSite: "None"`. Must become environment-driven. | ✅ |
| `client/blog-versum/src/store/useAuthStore.js` | `BASE_URL` already resolves to `"/"` in a production build — confirmed, no change needed. | ✅ |
| **`server/src/index.js`** | Add `app.set("trust proxy", 1);` **before** the routes. | ✅ |

---

## 4. Infrastructure changes

- **AWS security group**: remove the `5001` inbound rule. Only `22` (SSH) and `80`
  (HTTP) should remain open — add `443` once TLS is in place (§6).
- **DNS**: point your domain's A record at the EC2 instance's public IP (previously
  frontend traffic went to Vercel, so this is a new record or a change to an existing
  one).

---

## 5. Rollout steps

1. Add `Dockerfile` and `nginx.conf` to `client/blog-versum/`; replace root
   `docker-compose.yml`; apply the code changes from §3.
2. Update DNS to point at the EC2 instance.
3. Update the EC2 security group (remove `5001`, confirm `22` + `80`).
4. SSH into the box, `git pull`, then `docker compose build` (expect this to take
   longer than before — it now runs a full frontend build too).
5. `docker compose up -d` — Redis starts first, then `app` (depends on Redis), then
   `client` (depends on `app`). Only `client`'s port 80 is published to the host.
6. Verify: the site loads at `http://your-domain/`, `http://your-domain/api/...`
   reaches the backend, and a Socket.IO connection upgrades to a real WebSocket in
   the browser's network tab (not stuck on long-polling).
7. Once confirmed working end-to-end, retire the Vercel project/deployment.
8. Add TLS (§6).

---

## 6. TLS (follow-up, before real production traffic)

The `client` container as planned only serves plain HTTP on port 80. Two options,
not yet decided:
- Certbot + a second `server { listen 443 ssl; }` block in `nginx.conf`, with
  certificates mounted into the container.
- Put the EC2 instance behind a load balancer or CDN that terminates TLS and
  forwards plain HTTP to the instance on port 80.

> **⚠️ TLS is not actually optional for this app — it is a launch blocker, not a
> follow-up.** The auth cookie is `httpOnly` and the JWT rides in it; over plain
> HTTP that cookie is (a) refused by the browser today because of the hardcoded
> `secure: true` (§8.1) and (b) even after that fix, transmitted in cleartext and
> trivially sniffable. **Recommendation: get TLS working *before* the first real
> cut-over**, using the low-effort path below (Cloudflare in front, free) so the
> "limited EC2 credits" constraint isn't spent on an ALB. See
> `PLAN_SECURE_DEPLOYMENT_PREREQUISITES.md` §2 for the concrete cheapest-path TLS
> setup. Do the §8.1 cookie fix regardless — it is required for *either* HTTP or
> HTTPS to work correctly.

---

## 7. Known trade-offs to keep in mind

- **One deploy pipeline instead of two**: a frontend-only change now requires a full
  `docker compose build` + SSH + `up -d` on the EC2 box, rather than an independent
  Vercel push. No CI/CD exists yet (per `PLAN3.md`), so this is a fully manual
  rollout for now.
- **`depends_on` only controls start order, not readiness** — if `app` is still
  connecting to MongoDB Atlas when `client` starts, early `/api/*` requests may
  briefly 502 until `app` finishes booting. Not usually an issue in practice.
- **Horizontal scaling is still out of scope** — this plan doesn't touch the
  known gap where Socket.IO presence (`userSocketMap`) lives in a single process's
  memory; that still needs the deferred Redis adapter work before running more than
  one `app` instance.

---

## 8. Cross-check: bottlenecks found & required refinements

This section is the result of scanning the actual code against the plan above.
Items are ordered blocker → high → medium. **§8.1–§8.3 must be resolved before the
cut-over or the deploy will not work / will not be safe.** Security hardening
(rate limiting, bot blocking, body limits, etc.) has its own dedicated companion
document: **`PLAN_SECURE_DEPLOYMENT_PREREQUISITES.md`** — this section only covers
what breaks or degrades the *deployment* itself.

### 8.1 ✅ RESOLVED — auth cookie was `secure: true` / `sameSite: "None"`, hardcoded

`server/src/lib/utils/token.js` currently sets the JWT cookie with
`secure: true, sameSite: "None"` unconditionally (the environment-aware version is
commented out just above it). Consequences for *this* plan:

- **On the port-80 / plain-HTTP rollout (steps §5), the browser silently discards
  the cookie** (a `Secure` cookie cannot be stored over `http://`). `POST /login`
  returns 200, but `GET /api/auth/check` immediately 401s — the classic "login
  does nothing" symptom. This will look like a backend bug and burn debugging time.
- `sameSite: "None"` was only needed because the frontend (Vercel) and backend
  (EC2) were *cross-origin*. After this plan they are **same-origin**, so `"None"`
  is now both unnecessary and strictly worse (it needs `Secure`, and widens CSRF
  exposure). Correct value is `"Lax"`.

**Fix — make it environment-driven and same-origin-correct:**

```js
const isProd = process.env.NODE_ENV === "production";
res.cookie("jwt", token, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: isProd,          // true only once served over HTTPS (§6 / prereqs §2)
    sameSite: "Lax",         // same-origin now — Lax is correct and CSRF-safer
});
```

If the very first cut-over is HTTP-only (TLS not wired yet), set `NODE_ENV` to
something other than `production` *temporarily* OR — strongly preferred — bring up
TLS first (see prereqs §2) and keep `NODE_ENV=production` with `secure: true`.
**Do not ship to real users on HTTP.**

> **Implemented** in `server/src/lib/utils/token.js` exactly as above:
> `secure: process.env.NODE_ENV === "production"`, `sameSite: "Lax"`. Still true
> that TLS must be live before this goes to real users — that part is unchanged
> and tracked in §6/§9.

### 8.2 ✅ RESOLVED — `server/src/lib/socket.js` CORS was hardcoded to localhost

Already flagged in §3, restated here because it is a hard failure, not a nicety:
`new Server(server, { cors: { origin: ["http://localhost:5173"] } })`. In
production the Socket.IO handshake origin is your public domain, so the WebSocket
upgrade is **rejected** and real-time messaging/presence silently dies (the client
gives up after failing polling too). Apply the §3 change
(`origin: process.env.CLIENT_URL || "http://localhost:5173"`). Note: because the
client now connects **same-origin** through nginx, this mostly protects you if a
future change reintroduces an absolute URL — but leaving the localhost hardcode in
is a latent outage, so fix it.

> **Implemented** — `server/src/lib/socket.js` now reads `process.env.CLIENT_URL`
> with the localhost fallback, matching the main Express CORS setup.

### 8.3 ✅ RESOLVED — `trust proxy` was not set → per-IP logic & rate limiting misfire

Express behind nginx sees every request as coming from the nginx container's IP.
Without `app.set("trust proxy", 1)` (§3), the rate limiters added in the prereqs
doc would throttle *all users as one bucket*, and any per-IP logging is useless.
Pair it with nginx forwarding `X-Forwarded-For` (the prereqs nginx config does).
Set `trust proxy` to `1` (single known proxy hop = the nginx container), **not**
`true`, so a client can't spoof `X-Forwarded-For`.

> **Implemented** — `app.set("trust proxy", 1)` in `server/src/index.js`, before
> any middleware/routes. nginx forwards `X-Forwarded-For` on every proxied
> location (verified in the actual `nginx.conf`).

### 8.4 ✅ RESOLVED — `depends_on` didn't wait for `app` readiness → first-load 502s

Already noted in §7 as a "not usually an issue," but with nginx as the front door
it's more visible: nginx will start proxying to `app:5001` the instant the
container starts, before Express has bound the port / connected to Atlas, returning
**502** to the very first visitors after every `up -d`. Refinements:

- Add a real **healthcheck** to the `app` service and make `client` depend on it
  with `condition: service_healthy` (mirrors how `app` already waits on `redis`):

  ```yaml
  app:
    # ...
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:5001/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s
  client:
    depends_on:
      app:
        condition: service_healthy
  ```

- This requires a tiny **`GET /api/health`** route in the backend (no auth, returns
  200 + `{status:"ok"}`). Add it in `index.js` before the route mounts. It doubles
  as the load-balancer / uptime-check target later.
- In `nginx.conf`, add `proxy_next_upstream error timeout http_502;` and a short
  `proxy_connect_timeout` so a momentarily-not-ready backend degrades more softly.

> **Implemented:** `/api/health` route + the `app` healthcheck + `client`'s
> `depends_on: app: condition: service_healthy` are all in the compose file exactly
> as specified above. **Not yet implemented:** the `proxy_next_upstream` /
> `proxy_connect_timeout` softening — the healthcheck gate makes this low-value for
> the first boot, but still worth adding for mid-life `app` restarts. Left as a P2
> follow-up, not a blocker.

### 8.5 🟠 HIGH — `/api/internal/*` becomes publicly routable through nginx

The plan forwards **all** `/api/` to `app`, which now includes the AI-publishing
endpoint `POST /api/internal/posts`. Previously that endpoint was already exposed
on `:5001`, so this isn't a regression, but the new front door is a good moment to
tighten it. It is protected by the `x-api-key` shared secret (fail-closed — good),
**but**:

- It must stay reachable because the planned **Lambda agent talks to it over the
  public domain** (README "AI agents on AWS Lambda"). So you cannot simply block it
  at nginx by path.
- **Refinement:** give `/api/internal/` its own stricter nginx `limit_req` zone
  (a handful of req/min is plenty for scheduled publishing) and confirm
  `INTERNAL_API_KEY` is a full 32-byte random value (`openssl rand -hex 32`), never
  the placeholder. Details in prereqs §4. Consider moving it under a
  non-guessable path prefix as defence-in-depth. Rotating the key is a config-only
  change on both `server/.env` and the Lambda env.

> **Status:** the nginx `limit_req zone=internal` and Express `internalLimiter`
> (§3.2 of the prereqs doc) are both wired in, and `internalApiAuth.js` now does a
> constant-time key comparison. **Still pending as deploy-time actions:** generating
> the real `openssl rand -hex 32` key on the box, and the optional non-guessable
> path prefix (not done — low priority given the rate zone + strong key already
> cover the realistic threat).

### 8.6 🟡 MEDIUM — container runs as root; no `.dockerignore` for the client

- Both the existing `server/Dockerfile` and the new client build run as **root**
  inside the container. Add a non-root user (`USER node` is already available in
  `node:20-alpine`) to the server image, and drop privileges in the nginx stage.
  Cheap hardening, zero downside.
- The **client build context** (`client/blog-versum/`) contains `node_modules/` and
  a stale `dist/`. Without a `.dockerignore`, `COPY` drags hundreds of MB into the
  build, slowing the already-slow frontend build (§5 step 4) and risking a stale
  `dist` leaking in. Add `client/blog-versum/.dockerignore` with `node_modules`,
  `dist`, `.env`, `.git`, `*.log`.

> **Status:** `server/Dockerfile` now has `USER node` after the `COPY` steps — ✅
> done. `client/blog-versum/.dockerignore` — ✅ done, `server/.dockerignore` also
> tightened to include `.git`/`*.log`/`.env.*`. **Not done:** the nginx stage of
> the client image still runs as root (the base `nginx:1.27-alpine` image's
> default) — dropping privileges there needs an unprivileged-nginx pattern
> (rebinding to a port >1024 or the `nginxinc/nginx-unprivileged` image) that
> wasn't in scope for this pass. Tracked as a P2 remaining item.

### 8.7 🟡 MEDIUM — resource sizing on a credit-constrained instance

Three containers now share the box: nginx (tiny), `app` (Node), and `redis`
(capped at **512 MB**). On a **`t3.small` (2 GB RAM)** the Redis cap alone is a
quarter of RAM before the JVM-free Node heap and OS. Refinements for "limited
credits":

- Drop Redis `--maxmemory` to **`256mb`** for a `t3.small` — the feed cache TTLs
  are 20–180s and the working set is small; 256 MB is ample and leaves headroom.
- Add lightweight `deploy.resources` / `mem_limit` caps so one container OOM can't
  take the whole box down.
- `t3.micro` (1 GB) is *not* recommended for all three; `t3.small` is the realistic
  floor, `t3.medium` comfortable. This matches the README's existing guidance.

> **Status:** Redis `--maxmemory` lowered to `256mb` in `docker-compose.yml` — ✅
> done. **Not done:** per-container `mem_limit`/`deploy.resources` caps — left out
> since Compose (non-Swarm) `deploy.resources` is silently ignored without
> `docker stack deploy`; the equivalent for plain `docker compose` is `mem_limit`/
> `cpus` directly on each service, which wasn't added. Worth doing before the real
> box deploy if credits are tight.

### 8.8 🟡 MEDIUM — build-arg / env consistency checks (easy to get wrong)

- The client Dockerfile must receive `VITE_API_URL=/api` as a **build arg** (Vite
  inlines env at *build* time, not runtime) — a runtime env var will do nothing.
  Verify the `docker-compose.yml` `build.args` actually passes it.
- `server/.env` on the box must set `NODE_ENV=production`, `REDIS_URL=redis://redis:6379`,
  `CLIENT_URL=https://your-domain` (scheme matters for the CORS/cookie logic), and
  a real `INTERNAL_API_KEY`. A single wrong scheme here reintroduces the §8.1 class
  of "login silently fails" bug.

> **Status:** `docker-compose.yml`'s `client.build.args.VITE_API_URL: /api` is
> wired and confirmed via `docker compose config` — ✅ done. The `server/.env`
> values are a deploy-time checklist item for when the box is actually stood up
> (§9 steps 3–5), not something fixable in the repo.

### 8.9 ✅ RESOLVED — minor correctness / info-leak cleanups (not deploy-blocking)

Found while scanning; fold in opportunistically, tracked in detail in prereqs §6:

- `signup` rejects passwords `< 8` but the message says *"at least 6 characters"*
  (`auth.controller.js`). Cosmetic, but confusing.
- Several controllers return raw `err.message` to the client (`posts.controller.js`,
  `internal.controller.js`, `message.controller.js` `getMessages`). Low-value info
  disclosure; return a generic message and log the detail server-side.
- `express.json({ limit: '10mb' })` is large for a JSON API and is a cheap DoS /
  Cloudinary-cost lever (base64 image uploads). Tightened in prereqs §3.

---

## 9. Refined rollout order (supersedes §5 for the first deploy)

1. ✅ **Code fixes first** (all in one commit): §8.1 cookie, §8.2 socket CORS,
   §8.3 `trust proxy`, §8.4 `/api/health`, plus the full hardening set from
   `PLAN_SECURE_DEPLOYMENT_PREREQUISITES.md` (rate limiting, helmet, body limits).
   — **Done**, plus `npm audit fix`/`--force` brought dependency vulnerabilities
   to 0 (nodemailer force-upgraded to 9.0.3, verified against actual usage).
2. ✅ Add `Dockerfile` + `nginx.conf` + `.dockerignore` to the client; replace root
   `docker-compose.yml` (with app healthcheck + Redis cap from §8.4/§8.7). — **Done**,
   validated with `nginx -t` and `docker compose config`.
3. ⏳ **Stand up TLS before exposing to users** (prereqs §2 — Cloudflare path is free
   and doesn't spend EC2 credits). Keep `NODE_ENV=production` so `secure: true`.
   — **Not started.**
4. ⏳ Point DNS at the instance; lock the security group (SSH to *your IP only*,
   80/443 open, 5001 removed) — prereqs §1. — **Not started.**
5. ⏳ `docker compose build` → `up -d`; wait for `app` healthy before smoke-testing.
   — **Not started** — this is the first real run on the actual EC2 box; only
   validated locally against `nginx -t` / `docker compose config` so far, not a
   live `up -d`.
6. ⏳ Verify: site loads over **HTTPS**, login sets the cookie and `/api/auth/check`
   returns the user, Socket.IO upgrades to a real WebSocket, a rate-limited endpoint
   returns 429 after threshold, and `/api/internal/posts` rejects a missing key.
7. ⏳ Retire Vercel once green.

**Everything through step 2 is done. Steps 3–7 are the remaining work**, and they're
all infrastructure/deploy actions on the actual EC2 box + DNS + Cloudflare/registrar,
not code changes.