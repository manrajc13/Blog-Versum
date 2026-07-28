import redis from "../lib/redis.js";

// Aggregate daily request budget across ALL clients — a cost circuit-breaker.
//
// The per-IP express-rate-limit limiters cap a single abuser, but nothing bounds the
// TOTAL number of API requests per day, so nothing bounds worst-case AWS/Cloudinary
// cost. This middleware counts every /api request into one shared Redis counter keyed
// by the UTC date and returns 429 once the day's budget is spent. It is a demo-grade
// guardrail, not a per-user throttle (one abuser can exhaust the shared budget) — the
// real cost backstop is an AWS Billing alarm + Cloudinary usage alert.
//
// Redis-backed (not in-memory) so the count survives an `app` restart. Fails OPEN: a
// Redis blip must never take the whole API down.

const DAILY_BUDGET = Number(process.env.GLOBAL_DAILY_BUDGET || 5000);
const TTL_SECONDS = 60 * 60 * 26; // ~26h — comfortably past a UTC-day rollover

export async function globalDailyBudget(req, res, next) {
    // Mounted at "/api", so req.path here is the path AFTER /api (e.g. "/health").
    // Never let container health checks burn the user-facing budget.
    if (req.path === "/health") return next();

    try {
        const day = new Date().toISOString().slice(0, 10); // UTC yyyy-mm-dd
        const key = `budget:api:${day}`;
        const count = await redis.incr(key);
        if (count === 1) await redis.expire(key, TTL_SECONDS); // set TTL once, on creation

        res.set("X-Daily-Budget-Remaining", String(Math.max(0, DAILY_BUDGET - count)));

        if (count > DAILY_BUDGET) {
            return res
                .status(429)
                .json({ message: "Service is at capacity for today. Please try again tomorrow." });
        }
        next();
    } catch (err) {
        console.error("globalDailyBudget error (failing open):", err.message);
        next(); // availability > strictness
    }
}

export default globalDailyBudget;
