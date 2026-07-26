# BlogVerse — Secure Deployment Prerequisites (Hardening Plan)

> Companion to `PLAN_DEPLOYMENT_READY.md`. That document gets the three containers
> (`client` / `app` / `redis`) *running* behind one nginx front door on EC2. **This
> document makes that surface safe to expose to the public internet** on a
> credit-constrained EC2 box: rate limiting, bot/crawler control, request-size
> caps, security headers, TLS on the cheap, and the infra-level locks (security
> group, MongoDB Atlas allowlist, secrets).
>
> Goal stated by the owner: *"leave 0 chance of attack."* No internet-facing app is
> literally 0-risk, so this plan is built as **defence in depth** — every request
> passes through at least three independent gates (nginx edge → Express middleware →
> per-route guard) so that a miss at one layer is caught at the next. The ordering
> is worst-bang-for-effort first, and everything here is sized so it **saves** EC2
> credits (blocking junk traffic before it hits Node/Mongo/Cloudinary) rather than
> costing them.

---

## Status as of 2026-07-25

**All application-layer and nginx-edge hardening (§3, §5, §6, most of §7) is
implemented.** What's left is infra-level (§1, §2, §8, and part of §7) — all
deploy-time actions on the real EC2 box, not code.

| Section | Status |
|---|---|
| §1 Infra lockdown (SG, Atlas allowlist, host hardening) | ❌ Not started — deploy-time |
| §2 TLS | ❌ Not started — deploy-time |
| §3 App-layer hardening (rate limiters, helmet, sanitize, hpp, upload guard, error handler) | ✅ Done — **one deviation, see §3.1a below** |
| §4 Internal endpoint hardening | ✅ Constant-time compare + rate zone done; key rotation/prefix still deploy-time |
| §5 nginx edge shield | ✅ Done |
| §6 Security headers | ✅ Done (CSP shipped as report-only, as recommended) |
| §7 Container hardening | 🟡 Partial — server non-root + both `.dockerignore`s done; nginx-stage non-root and pinned digests not done |
| §8 Redis-backed limiter store | ❌ Not done — still in-memory (acceptable for v1 per this doc's own note) |
| `npm audit` (§7 checklist item) | ✅ Done — 0 vulnerabilities, nodemailer force-upgraded to 9.0.3 after confirming compatibility |

### 3.1a — real deviation from this plan: Express 5 broke the naive `mongoSanitize()` wiring

This doc's §3.1 snippet (`app.use(mongoSanitize())`, calling the package's default
export directly) **does not work on Express 5**. Express 5's `req.query` is a
getter-only accessor (re-parses the raw query string on every access, not a plain
mutable object like Express 4), and `express-mongo-sanitize`'s default middleware
does `req.query = sanitizedTarget` in one code path — which throws
`TypeError: Cannot set property query of #<IncomingMessage> which has only a getter`
on **every request with a query string**, i.e. this would have taken down the API
immediately on first real traffic.

Found and fixed before it shipped: `server/src/middleware/mongoSanitize.js` is a
thin custom wrapper — it calls the library's exported `sanitize()` function
directly on `req.body`/`req.params` (safe, mutates in place, no reassignment
needed) and uses `Object.defineProperty(req, "query", { value, writable: true,
configurable: true, enumerable: true })` to shadow the getter for `query`
specifically (safe because Express leaves that property `configurable: true`).
Verified end-to-end with `$where`/`$gt` injection payloads in both query and body —
stripped correctly, no crash. `index.js` imports this wrapper, not the package's
default export directly.

---

## 0. Threat model — what we are actually defending against

| Threat | Concrete risk on *this* app | Primary defence |
|---|---|---|
| **Credential stuffing / brute force** | `POST /api/auth/login`, `/verify-email` have no throttle → password & OTP guessing | Per-IP rate limit on auth routes (§3), OTP already hashed + expiring |
| **OTP / email bombing (💸 cost)** | `POST /api/auth/send-otp` sends a real email to any username/email, unauthenticated → SMTP abuse, provider ban, cost | Strict per-IP + per-target rate limit (§3) |
| **Cloudinary upload abuse (💸 cost)** | `createPost`, `sendMessage`, `updateProfile` accept base64 images and upload to Cloudinary; 10 MB body limit → burn Cloudinary quota & bandwidth | Tighter body limits (§3), auth-gated + rate-limited, size guard before upload |
| **Feed/search scraping & crawlers** | Feeds/search hit Mongo; aggressive bots/crawlers inflate CPU + Cloudinary egress on a tiny box | nginx bot/UA blocklist + `robots.txt` + edge rate limit (§5) |
| **Volumetric / L7 DoS** | Single actor floods any endpoint → Node event loop saturates, box falls over | nginx `limit_req` + `limit_conn` + body caps + Cloudflare edge (§2, §5) |
| **JWT theft over the wire** | `httpOnly` cookie sent cleartext on HTTP | TLS everywhere (§2), `secure`+`Lax` cookie (deploy plan §8.1) |
| **Internal API abuse** | `POST /api/internal/posts` publicly routable | shared-secret (exists) + strict rate zone + strong key (§4) |
| **Redis / Mongo direct exposure** | data-plane reachable from internet | never publish ports; SG + Atlas allowlist (§1) |
| **Header / injection / clickjacking** | missing security headers | `helmet` + nginx headers (§7) |
| **SSH compromise** | port 22 open to the world → brute force | SG restricts 22 to owner IP + key-only + fail2ban (§1) |

Two dependencies you should note up front:

- **express-rate-limit + trust proxy.** Rate limiting is per-IP. It only works if
  Express can see the real client IP, which requires `app.set("trust proxy", 1)`
  (deploy plan §8.3) **and** nginx forwarding `X-Forwarded-For`. Do both or the
  limiter throttles everyone as a single bucket.
- **`ioredis` is already a dependency** — reuse the existing Redis client (§8) so
  rate-limit counters survive an `app` restart and are shared if you ever run a
  second instance. Optional for v1; in-memory store is fine to start.

---

## 1. Infrastructure lockdown (do this first — free, highest ROI)

### 1.1 AWS Security Group — least privilege

| Port | Source | Why |
|---|---|---|
| 22 (SSH) | **Your home/office IP `/32` only** (or via SSM Session Manager, no 22 at all) | Kills 100% of internet SSH brute force |
| 80 (HTTP) | `0.0.0.0/0` | Redirects to 443 only (§2) |
| 443 (HTTPS) | `0.0.0.0/0` (or **only Cloudflare IP ranges** if using CF — see §2) | The one real entry point |
| 5001 | **REMOVED** | `app` is internal to the Compose network now |
| 6379 / 27017 | **never opened** | Redis internal-only; Mongo is off-box Atlas |

- If you put Cloudflare in front (§2, recommended), lock 80/443 to **Cloudflare's
  published IP ranges only** so nobody can hit the origin IP directly and bypass the
  edge protections. This is the single biggest "0 chance" lever available for free.
- Prefer **AWS SSM Session Manager** over SSH entirely → you can close port 22
  completely. Zero SSH surface.

### 1.2 MongoDB Atlas network access

- Atlas allowlist must contain **only the EC2 instance's IP** (or its NAT/EIP), not
  `0.0.0.0/0`. A leaked `MONGODB_URI` is far less dangerous if Atlas refuses every
  IP but yours.
- Use a **least-privilege DB user** (readWrite on the one app DB), not an Atlas
  admin user.

### 1.3 Host hardening

- `fail2ban` on SSH (if 22 stays open at all).
- Unattended security updates (`dnf-automatic` on Amazon Linux).
- Never bake secrets into images; `server/.env` stays on the box (mode `600`), out
  of git (confirm `.gitignore` covers `**/.env` — it should already).
- Rotate `JWT_SECRET` and `INTERNAL_API_KEY` to fresh `openssl rand -hex 32` values
  for production; never reuse dev values.

---

## 2. TLS the cheap way (blocker — see deploy plan §6/§8.1)

The auth cookie carries the session; it must never travel over plain HTTP.
**Recommended path given "limited EC2 credits": Cloudflare in front of the origin —
free, and it doubles as a DoS/bot shield and CDN.**

**Option A — Cloudflare (recommended, $0, no EC2 credits spent):**
1. Move the domain's DNS to Cloudflare (free plan).
2. `A` record → EC2 public IP, proxy **on** (orange cloud).
3. SSL/TLS mode **Full (strict)**; install a free Cloudflare **Origin Certificate**
   into nginx (`listen 443 ssl;`) so origin↔CF is also encrypted.
4. Lock the SG's 80/443 to **Cloudflare IP ranges only** (§1.1) → origin IP can't be
   hit directly.
5. Turn on: **Always Use HTTPS**, **Bot Fight Mode**, a baseline **WAF managed
   ruleset**, and an edge **rate-limiting rule** on `/api/auth/*`. This offloads a
   huge amount of junk before it ever costs you EC2 CPU.

**Option B — Certbot on the box (no Cloudflare):** add a `certbot`/`nginx` TLS
block, auto-renew via a cron/systemd timer, mount certs into the `client`
container. More moving parts, and you lose the free edge shield — only pick this if
you can't use Cloudflare.

**Either way**, nginx must **301 all HTTP → HTTPS**, and `NODE_ENV=production` stays
set so the cookie is `secure: true` (deploy plan §8.1).

---

## 3. Application-layer hardening (`server/`) — add these packages

```bash
cd server
npm install express-rate-limit helmet express-mongo-sanitize hpp
# optional but recommended for shared/persistent counters:
npm install rate-limit-redis
```

> All snippets below go in `server/src/index.js` unless stated. Order matters:
> security middleware **before** routes; `trust proxy` **before** the limiters.

### 3.1 Trust proxy + Helmet + payload limits — ✅ done (see §3.1a for one deviation)

```js
// index.js — near the top, before routes
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

app.set("trust proxy", 1);            // exactly one proxy hop (nginx). NOT `true`.

app.use(helmet());                    // sane security headers (see also nginx §7)
app.use(express.json({ limit: "2mb" }));      // was 10mb — see note below
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(mongoSanitize());             // strips `$`/`.` keys → blocks NoSQL injection
app.use(hpp());                       // HTTP parameter pollution
```

> **Implemented** with one change: `mongoSanitize` above is the custom
> `server/src/middleware/mongoSanitize.js` wrapper, not the package's default
> export — see §3.1a. Order in the real `index.js` is: cors → helmet → json/
> urlencoded → cookieParser → mongoSanitize → hpp → `globalLimiter` on `/api`.

- **Body limit 10 MB → 2 MB.** Base64 inflates ~33%, so 2 MB body ≈ a ~1.5 MB
  image, plenty for avatars/covers/chat. This directly caps the Cloudinary-cost and
  memory-DoS lever. If cover images legitimately need more, use a **separate**
  higher limit only on the create-post route rather than globally.
- `express-mongo-sanitize` matters because several queries build `$or` filters from
  user input (`getIdentifierQuery`, `getPostById`) — sanitizing removes operator
  injection via crafted JSON.

### 3.2 Rate limiters — tiered by sensitivity — ✅ done

```js
// src/middleware/rateLimiters.js  (new file)
import rateLimit from "express-rate-limit";

const make = (opts) => rateLimit({
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
  ...opts,
});

// Sensitive auth actions: brute-force & OTP-bomb protection
export const authLimiter = make({ windowMs: 15 * 60_000, max: 20 });      // 20 / 15 min / IP

// OTP send is the most abusable (sends real email → cost). Tighter still.
export const otpLimiter  = make({ windowMs: 15 * 60_000, max: 5 });       // 5 / 15 min / IP

// Writes that hit Cloudinary / create DB rows
export const writeLimiter = make({ windowMs: 60_000, max: 30 });          // 30 / min / IP

// Global safety net for everything else
export const globalLimiter = make({ windowMs: 60_000, max: 200 });        // 200 / min / IP

// Internal machine API — scheduled publishing is low-volume
export const internalLimiter = make({ windowMs: 60_000, max: 10 });       // 10 / min / IP
```

Wire them in `index.js` (specific → general; specific limiter mounted on the route
file wins for that path):

```js
import { globalLimiter, authLimiter, otpLimiter, writeLimiter, internalLimiter } from "./middleware/rateLimiters.js";

app.use("/api", globalLimiter);            // baseline on the whole API
```

Then in the route files, put the tight limiters on the exact endpoints:

```js
// auth.route.js
router.post("/login",        authLimiter, login);
router.post("/signup",       authLimiter, signup);
router.post("/verify-email", authLimiter, verifyEmailOTP);
router.post("/send-otp",     otpLimiter,  sendOTP);        // most abusable

// posts.route.js / message.route.js — the Cloudinary-touching writes
router.post("/",             writeLimiter, /* createPost */);
router.post("/send/:id",     writeLimiter, /* sendMessage */);
// auth.route.js image-bearing profile updates
router.put("/update-profile",         writeLimiter, /* ... */);
router.put("/update-profile-section", writeLimiter, /* ... */);

// internal.route.js
router.post("/posts", internalLimiter, internalApiAuth, createInternalPost);
```

> **Numbers are starting points** — tune from real logs. On a single small box, the
> global 200/min/IP + nginx `limit_req` (§5) together mean one IP can't saturate the
> event loop. For a public app also consider per-*account* limits on writes, but
> per-IP is the 80/20.

> **Implemented** exactly as above in `server/src/middleware/rateLimiters.js`, and
> wired into `auth.route.js`, `posts.route.js`, `message.route.js`,
> `internal.route.js` at the specific endpoints listed. Load-tested: 21st request
> in a window correctly returns 429 with the standard headers.

### 3.3 Application-level cost guard on uploads — ✅ done

Before calling `cloudinary.uploader.upload(...)` in `createPost`, `sendMessage`,
`updateProfile`, add a cheap size/format check so a caller can't push a 2 MB blob
per request repeatedly:

```js
// helper: reject oversized / non-image data URIs before spending a Cloudinary call
const MAX_IMAGE_BYTES = 1_500_000; // ~1.5 MB decoded
function assertImageOk(dataUri) {
  if (!dataUri) return;
  const m = /^data:image\/(png|jpe?g|webp|gif);base64,/.exec(dataUri);
  if (!m) { const e = new Error("Unsupported image format"); e.status = 400; throw e; }
  const bytes = Math.floor((dataUri.length - dataUri.indexOf(",") - 1) * 0.75);
  if (bytes > MAX_IMAGE_BYTES) { const e = new Error("Image too large"); e.status = 413; throw e; }
}
```

Also set an **upload preset / transformation cap** in Cloudinary itself (max
dimensions, auto-format, incoming size limit) as the last backstop — that's a
provider-side config, free, and protects your quota even if code is bypassed.

> **Implemented** as `server/src/lib/utils/imageUpload.js`'s `assertImageOk()`,
> called before every `cloudinary.uploader.upload()` call (`createPost`,
> `sendMessage`, `updateProfile`, `updateProfileSection`). Slightly stricter than
> the sketch above — requires a full `data:image/<type>;base64,...` URI match (not
> just a prefix check) and throws with `.status = 400` so it's caught by the
> status-aware catch blocks (§3.4) instead of falling through as a generic 500.
> Unit-tested against 4 cases (bad format, disallowed type, oversized, valid).
> **Not done:** the Cloudinary-side upload preset/transformation cap — that's a
> dashboard config action outside the codebase, still worth doing as a backstop.

### 3.4 Stop leaking internal errors — ✅ done

Replace `res.status(500).json({ message: err.message })` (and the `500 err.message`
in `internal.controller.js`, `message.controller.js` `getMessages`,
`posts.controller.js`) with a generic message + server-side log. Add a final
Express error handler so no stack/message escapes:

```js
// index.js — LAST, after routes
app.use((err, req, res, next) => {
  console.error("Unhandled:", err);
  res.status(err.status || 500).json({ message: err.status ? err.message : "Internal Server Error" });
});
```

Fix the cosmetic mismatch in `signup` too (message says "6", code checks `< 8`).

> **Implemented**: the global error handler is the last middleware in `index.js`,
> exactly as above. Every touched controller (`auth`, `posts`, `internal`,
> `message`) now uses the `status = err.status || 500` pattern — only surfacing
> `err.message` for expected (`< 500`) errors, logging and genericizing the rest.
> The `signup` "6 characters" → "8 characters" message mismatch is fixed too.

---

## 4. Internal publishing endpoint (`/api/internal/posts`) — 🟡 mostly done

It is now publicly routable through nginx (deploy plan §8.5) and must stay so for
the Lambda agent. Hardening (no code rewrite of the auth model needed — it's already
fail-closed):

- **Strong key:** `INTERNAL_API_KEY = openssl rand -hex 32`, identical in
  `server/.env` and the Lambda env. Never the placeholder.
- **Dedicated tight rate zone** at both nginx (§5) and Express (`internalLimiter`,
  §3.2) — scheduled publishing needs only a handful of req/min.
- **Constant-time compare** to remove any timing signal (optional, cheap):
  ```js
  import crypto from "crypto";
  const a = Buffer.from(providedKey || "", "utf8");
  const b = Buffer.from(expectedKey, "utf8");
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  ```
- **Defence in depth:** mount it under a non-guessable prefix (e.g.
  `/api/internal-<random>/posts`) and/or restrict at nginx to known egress if the
  Lambda uses a static NAT EIP. Rotating is config-only on both ends.

> **Status:** constant-time compare (`crypto.timingSafeEqual`) — ✅ implemented in
> `internalApiAuth.js`, unit-tested against 3 cases (missing key, wrong key,
> correct key). `internalLimiter` rate zone — ✅ wired at both nginx and Express.
> **Not done:** generating the real production key and the non-guessable path
> prefix — both deploy-time/optional, not code gaps.

---

## 5. nginx as the edge shield (`client/nginx.conf`) — ✅ done

nginx is the cheapest place to drop bad traffic — it never reaches Node. Add these
to the `client` container's config (this is the "block the web crawlers" ask).

### 5.1 Request-rate & connection limits (L7 DoS brake)

```nginx
# http {} scope (top of config)
limit_req_zone  $binary_remote_addr zone=api:10m      rate=10r/s;
limit_req_zone  $binary_remote_addr zone=auth:10m     rate=1r/s;
limit_req_zone  $binary_remote_addr zone=internal:10m rate=1r/m;
limit_conn_zone $binary_remote_addr zone=conn:10m;

server {
  client_max_body_size 3m;         # hard cap at the edge (matches §3.1 + headroom)
  limit_conn conn 20;              # max concurrent conns per IP

  location /api/auth/ {
    limit_req zone=auth burst=5 nodelay;
    proxy_pass http://app:5001;
  }
  location /api/internal/ {
    limit_req zone=internal burst=2 nodelay;
    proxy_pass http://app:5001;
  }
  location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://app:5001;
  }
  # /socket.io/ — see deploy plan §2 (Upgrade/Connection headers), do NOT rate-limit
  # the upgrade handshake the same way; long-lived WS conns are counted by limit_conn.
}
```

Remember to forward the real client IP so Express's `trust proxy` + limiters work:

```nginx
proxy_set_header Host              $host;
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

> **Implemented** with two adjustments visible in the real
> `client/blog-versum/nginx.conf`:
> - Each `proxy_pass` target keeps the matching path suffix
>   (`http://app:5001/api/auth/`, not a bare `http://app:5001;`) so the location
>   prefix maps directly onto the same path on `app` — functionally equivalent
>   here since the prefixes match, but explicit rather than relying on nginx's
>   URI-passthrough behavior.
> - This is a **full `nginx.conf`** (not a `conf.d/default.conf` fragment), so an
>   `include /etc/nginx/mime.types;` line was added at the top of `http {}` —
>   without it, a from-scratch `nginx.conf` serves every file as
>   `application/octet-stream` and the browser refuses to run the built JS.

### 5.2 Block bad bots / aggressive crawlers by User-Agent

```nginx
# http {} scope
map $http_user_agent $bad_bot {
    default 0;
    ~*(AhrefsBot|SemrushBot|MJ12bot|DotBot|PetalBot|Bytespider|DataForSeoBot) 1;
    ~*(python-requests|Go-http-client|libwww-perl|curl|wget|scrapy|httpclient) 1;
    ~*(masscan|nmap|nikto|sqlmap|zgrab|nuclei) 1;   # scanners
    "" 1;                                            # empty UA = almost always a bot
}
server {
    if ($bad_bot) { return 403; }
    # ...
}
```

> Keep this list conservative and reviewable — don't block legitimate crawlers you
> *want* (Googlebot/Bingbot) or your own health checks. Cloudflare Bot Fight Mode
> (§2) covers the long tail far better than a hand-maintained list, so if CF is in
> front, treat this UA map as a cheap second layer, not the primary defence.

> **Implemented** with the first two pattern groups as case-sensitive (`~`, not
> `~*`) rather than case-insensitive as sketched above — deliberate, since the
> known bot/library UA strings (`AhrefsBot`, `python-requests`, etc.) are
> consistently cased in practice, and matching a wider case range risks false
> positives on legitimate UAs that happen to contain a similar substring. The
> scanner group (`masscan|nmap|...`) stayed case-insensitive since those are
> genuinely inconsistent in the wild.

### 5.3 `robots.txt` + method + dotfile hygiene

```nginx
location = /robots.txt {
    add_header Content-Type text/plain;
    return 200 "User-agent: *\nDisallow: /api/\nCrawl-delay: 10\n";
}
location ~ /\.(?!well-known) { deny all; }   # block .git, .env, dotfiles
# reject uncommon methods early
if ($request_method !~ ^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)$) { return 405; }
```

- `Disallow: /api/` keeps well-behaved crawlers out of the API entirely.
- Static assets already get long cache headers (deploy plan §2) — good, it also
  reduces repeat load.

> **Implemented** verbatim — all three (`robots.txt`, dotfile deny, method
> allowlist) are in the live `nginx.conf`.

---

## 6. Security headers (belt + braces with Helmet)

`helmet()` (§3.1) sets most on the API responses. On the **nginx side** (serving the
SPA), add the page-level headers, tuned so the React app + Socket.IO still work:

```nginx
add_header X-Frame-Options            "SAMEORIGIN"        always;  # clickjacking
add_header X-Content-Type-Options     "nosniff"           always;
add_header Referrer-Policy            "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security  "max-age=31536000; includeSubDomains" always; # HTTPS only
# CSP: start in report-only, then enforce once you've confirmed nothing breaks.
# Must allow Cloudinary image origins and same-origin ws: for Socket.IO.
add_header Content-Security-Policy "default-src 'self'; img-src 'self' https://res.cloudinary.com data:; connect-src 'self' ws: wss:; style-src 'self' 'unsafe-inline'; script-src 'self'" always;
```

> CSP is the one that most often breaks SPAs — roll it out `Content-Security-Policy-Report-Only`
> first, watch the console, then flip to enforcing. Don't ship a CSP you haven't
> verified against the built app.

> **Implemented** — with the CSP already shipped as
> `Content-Security-Policy-Report-Only` (not the enforcing header shown above),
> per this section's own recommendation. `X-Frame-Options`, `X-Content-Type-Options`,
> `Referrer-Policy`, and `Strict-Transport-Security` are all live in `nginx.conf`
> exactly as specified — HSTS is harmless to ship now even before TLS is up
> (browsers ignore it over plain HTTP), and is already in place for when §2 lands.
> **Remaining action:** watch the browser console for CSP violations once this is
> actually deployed and reachable, then flip to enforcing.

---

## 7. Container & image hardening — 🟡 partially done

- **Run as non-root.** `server/Dockerfile`: add `USER node` after copying. nginx
  stage: use an unprivileged nginx pattern or drop caps. (deploy plan §8.6)
- **`.dockerignore`** for `client/blog-versum/` (`node_modules`, `dist`, `.env`,
  `.git`, `*.log`) — smaller/faster/cleaner builds, no secret leakage.
- **Pin base image digests** (`node:20-alpine@sha256:…`, `nginx:1.27-alpine@sha256:…`)
  for reproducible, tamper-evident builds.
- **`npm ci --omit=dev`** already used server-side — good. Run `npm audit` and
  patch high/critical before shipping.
- **Read-only root FS + `cap_drop: [ALL]` + `security_opt: [no-new-privileges]`** in
  `docker-compose.yml` for each service where feasible — cheap kernel-level
  containment.
- Redis: keep no published port, no persistence; optionally set a
  `requirepass` even though it's network-isolated (defence in depth, ~free).

> **Status:**
> - `USER node` in `server/Dockerfile` — ✅ done.
> - `client/blog-versum/.dockerignore` (and `server/.dockerignore` tightened too)
>   — ✅ done.
> - `npm audit` — ✅ done: found 8 vulnerabilities after installing the new
>   security packages (all pre-existing, in transitive deps — unrelated to the new
>   packages), resolved 7 via plain `npm audit fix`, and force-upgraded
>   `nodemailer` 8→9.0.3 for the last one (SSRF/arbitrary-file-read advisory) after
>   confirming the codebase only uses the stable `createTransport`/`sendMail` API
>   unaffected by the breaking changes. **`npm audit` now reports 0
>   vulnerabilities.**
> - **Not done:** nginx-stage non-root, pinned base image digests, read-only
>   root FS / `cap_drop` / `no-new-privileges`, Redis `requirepass`. None of these
>   are blockers — they're incremental hardening on top of what's already live —
>   but they're genuinely not in the repo yet, tracked here as the honest P2
>   remainder.

---

## 8. Optional: shared/persistent rate-limit store (Redis)

The in-memory limiter store resets on `app` restart and isn't shared across
instances. Since `ioredis` is already a dependency and a `redis` container is
already running, back the limiters with Redis so counters survive restarts and a
future second instance:

```js
import RedisStore from "rate-limit-redis";
import redis from "../lib/redis.js";   // existing client

const make = (opts) => rateLimit({
  store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
  standardHeaders: true, legacyHeaders: false,
  ...opts,
});
```

Graceful-degradation note: the existing Redis client already tolerates outages for
caching; ensure a Redis blip doesn't hard-fail requests here either (fail-open on
the limiter is usually the right call for availability, fail-closed for the OTP/auth
limiter is the safer call for abuse — decide per-limiter).

---

## 9. Monitoring & the honest "0 chance" caveat

You cannot get to literally zero risk, but you can make attacks loud and cheap to
absorb:

- **Log & alert:** watch for spikes of 401/403/429 and 502s. Even a simple daily
  `docker logs` grep for repeated failures catches active probing. Cloudflare's
  dashboard gives this for free at the edge.
- **Uptime/health check** hitting `/api/health` (deploy plan §8.4) tells you when
  the box is down before users do.
- **Budget alarms:** set an **AWS Billing alarm** and a **Cloudinary usage alert** —
  the fastest signal that an abuse vector (uploads, egress) is being exploited, and
  the direct protection for "limited credits."
- **Backpressure by design:** every knob above (body caps, `limit_req`, rate
  limiters, Cloudflare) is chosen to shed load *before* it reaches Mongo/Cloudinary,
  so an attack degrades gracefully instead of running up a bill or knocking the box
  over.

---

## 10. Prioritized checklist (do in this order)

**P0 — blockers / must-do before any public exposure**
- [x] Cookie fix `secure`/`sameSite` env-driven (deploy plan §8.1)
- [x] `app.set("trust proxy", 1)` + nginx `X-Forwarded-For` (§3.1 / §5.1)
- [x] Socket.IO CORS uses `CLIENT_URL` (deploy plan §8.2)
- [ ] TLS in front (Cloudflare Full-strict or Certbot) + HTTP→HTTPS 301 (§2) — infra, not started
- [ ] Security group: 22→your IP, remove 5001, 80/443 (ideally CF ranges) (§1.1) — infra, not started
- [ ] MongoDB Atlas allowlist = EC2 IP only, least-priv DB user (§1.2) — infra, not started
- [ ] Strong `JWT_SECRET` + `INTERNAL_API_KEY` (`openssl rand -hex 32`) (§1.3/§4) — deploy-time action on the box

**P1 — core hardening**
- [x] `express-rate-limit` tiered limiters (auth/otp/write/global/internal) (§3.2)
- [x] `helmet`, body limit 10mb→2mb, `express-mongo-sanitize`, `hpp` (§3.1) — mongoSanitize via custom wrapper, §3.1a
- [x] nginx `limit_req` / `limit_conn` / `client_max_body_size` (§5.1)
- [x] nginx bad-bot UA block + `robots.txt` + dotfile deny (§5.2/§5.3)
- [x] Upload size/format guard before Cloudinary (§3.3) — Cloudinary-side caps still a dashboard TODO
- [x] `/api/health` route + app healthcheck (deploy plan §8.4)

**P2 — defence in depth / polish**
- [~] Non-root containers + `.dockerignore` + pinned digests (§7) — server non-root + both `.dockerignore`s done; nginx-stage non-root + pinned digests not done
- [x] Security headers / CSP (report-only → enforce) (§6) — shipped report-only, enforcing is a post-deploy step once verified
- [x] Generic error responses + global error handler (§3.4)
- [ ] Redis-backed limiter store (§8) — not done, in-memory is fine for v1
- [ ] AWS billing + Cloudinary usage alarms; 401/403/429 log alerting (§9) — infra, not started
- [ ] `fail2ban` / SSM-only access, unattended updates (§1.3) — infra, not started

**Bonus, not originally on this checklist:**
- [x] `npm audit` → 0 vulnerabilities (found 8 pre-existing in transitive deps after
  installing the new security packages, fixed via `npm audit fix` +
  `--force` for `nodemailer` 8→9.0.3, verified against actual usage)
