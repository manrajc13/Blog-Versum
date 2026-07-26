import jwt from "jsonwebtoken";

const generateToken = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn:"1d",
    })
    res.cookie("jwt", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // requires HTTPS in production
        sameSite: "Lax", // app is same-origin behind nginx, no cross-site cookie needed
    });

    return token;
};

export default generateToken;