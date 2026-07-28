import jwt from "jsonwebtoken";

// Shared cookie attributes so the session cookie is SET and CLEARED with identical
// SameSite/Secure. This matters in the split (Vercel frontend + EC2 API) deployment:
// cross-site cookie writes — including the empty write that clears it on logout — are
// only accepted by the browser when SameSite=None + Secure. A mismatch means logout
// silently fails to clear the session in production.
//   - prod: cross-site  -> SameSite=None, Secure (requires HTTPS)
//   - dev:  same-site on localhost -> Lax, insecure (works without TLS)
export const cookieBaseOptions = () => {
    const isProd = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "None" : "Lax",
    };
};

const generateToken = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn:"1d",
    })
    res.cookie("jwt", token, {
        ...cookieBaseOptions(),
        maxAge: 24 * 60 * 60 * 1000,
    });

    return token;
};

export default generateToken;
