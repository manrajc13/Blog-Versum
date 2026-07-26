/**
 * authRedirect.js
 *
 * Tiny helper for the "gate then return" flow: when a logged-out visitor tries
 * to open an auth-only destination (e.g. a creator profile or a story), we stash
 * the intended path, send them through Login / Signup, and navigate them back to
 * that path once authentication completes.
 *
 * sessionStorage (not a query param) is used deliberately so the target survives
 * the multi-step signup → onboarding → home flow without threading props through
 * every page. The value is consumed (removed) on read so it never goes stale.
 */

const KEY = 'postAuthRedirect'

// Only same-origin app paths are honored, so a stored value can never redirect
// the user off-site after login.
const isSafeAppPath = (path) =>
  typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')

export const setPostAuthRedirect = (path) => {
  try {
    if (isSafeAppPath(path)) sessionStorage.setItem(KEY, path)
  } catch {
    // sessionStorage may be unavailable (private mode); redirect is best-effort.
  }
}

export const consumePostAuthRedirect = () => {
  try {
    const path = sessionStorage.getItem(KEY)
    if (path) sessionStorage.removeItem(KEY)
    return isSafeAppPath(path) ? path : null
  } catch {
    return null
  }
}
