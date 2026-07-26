import mongoSanitizeLib from "express-mongo-sanitize";

/*
express-mongo-sanitize's own middleware does `req.query = sanitized`, but in
Express 5 `req.query` is a getter-only accessor (re-parsed from the URL on
every access) with no setter, so that assignment throws
"Cannot set property query of #<IncomingMessage> which has only a getter"
on every request. `sanitize()` mutates body/params in place (safe to call
directly), but query needs its getter shadowed with an own property via
defineProperty instead of a plain assignment.
*/
const mongoSanitize = () => (req, res, next) => {
    if (req.body) mongoSanitizeLib.sanitize(req.body);
    if (req.params) mongoSanitizeLib.sanitize(req.params);
    if (req.query) {
        const sanitizedQuery = mongoSanitizeLib.sanitize(req.query);
        Object.defineProperty(req, "query", {
            value: sanitizedQuery,
            writable: true,
            configurable: true,
            enumerable: true,
        });
    }
    next();
};

export default mongoSanitize;
