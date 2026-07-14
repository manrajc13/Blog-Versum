import redis from "./redis.js";

/*
Cache-aside for keys that naturally spread load across many keys
(e.g. per-user feed:recommended:<userId>, feed:following:<userId>).
A Redis failure on GET or SET is caught and logged, never propagated —
worst case the app degrades to recomputing from Mongo on every request.
*/
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

/*
Cache-aside with a short distributed lock, used only for the single global
key (feed:trending:global) that every logged-in user hits. Guards against the
thundering-herd case where many concurrent requests miss the same expired key
at once and all recompute simultaneously.
*/
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
