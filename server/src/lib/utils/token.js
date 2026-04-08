import jwt from "jsonwebtoken";

const generateToken = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn:"1d",
    })
    // res.cookie("jwt", token, {
    //     maxAge: 24*60*60*1000,
    //     httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    //     secure: process.env.NODE_ENV !== "development", // only send cookie over HTTPS in production
    //     sameSite: "strict", // CSRF attacks cross-site request forgery attacks
    // });
    res.cookie("jwt", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,           // MUST be true for Render (HTTPS)
        sameSite: "None",       // MUST be None for cross-origin
    });

    return token;
};

export default generateToken;