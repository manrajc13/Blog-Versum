import crypto from "crypto";

export const generateOTP = () => {

    const plainOTP = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOTP = crypto
        .createHash("sha256")
        .update(plainOTP)
        .digest("hex");

    return {
        plainOTP,
        hashedOTP,
        expires: Date.now() + 10 * 60 * 1000
    };
};