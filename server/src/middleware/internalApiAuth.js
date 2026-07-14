// Guards internal, machine-to-machine endpoints (e.g. the LangGraph publisher).
// This is intentionally NOT JWT auth: there is no user session behind these
// calls, just a shared secret passed in the `x-api-key` header.
const internalApiAuth = (req, res, next) => {
    const providedKey = req.header("x-api-key");
    const expectedKey = process.env.INTERNAL_API_KEY;

    if (!expectedKey) {
        // Fail closed: if the server has no key configured, never accept a request.
        console.error("INTERNAL_API_KEY is not set — rejecting internal request.");
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!providedKey || providedKey !== expectedKey) {
        return res.status(401).json({ message: "Unauthorized - Invalid API Key" });
    }

    next();
};

export default internalApiAuth;
