// CSRF mitigation for the cross-origin (Vercel frontend -> EC2 API) deployment.
//
// The auth cookie is SameSite=None in production, so the browser attaches it to
// cross-site requests too. Strict CORS controls who can READ responses, but not who
// can FIRE state-changing requests. Requiring a custom header that only same-origin/
// allowlisted JS (our axios client) can set closes that gap: a cross-site <form>,
// <img>, or navigation cannot add a custom header, so it is forced into a CORS
// preflight that our allowlist rejects.
//
// Skips:
//   - safe methods (no state change)
//   - /api/internal/* — machine-to-machine, already protected by the x-api-key shared
//     secret; the Python agent (requests.post) does not send this browser header.

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function requireXHR(req, res, next) {
    if (SAFE_METHODS.has(req.method)) return next();
    if (req.path.startsWith("/api/internal")) return next();

    if (req.get("X-Requested-With") !== "XMLHttpRequest") {
        return res.status(403).json({ message: "Forbidden" });
    }
    next();
}

export default requireXHR;
