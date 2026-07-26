import rateLimit from "express-rate-limit";

const tooManyRequests = { message: "Too many requests, please try again later." };

const baseOptions = {
    standardHeaders: true,
    legacyHeaders: false,
    message: tooManyRequests,
};

// Login, signup, verify-email.
export const authLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    max: 20,
});

// send-otp — sends a real email per request, the most abusable route in the app.
export const otpLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    max: 5,
});

// Any route that uploads to Cloudinary: createPost, sendMessage, updateProfile.
export const writeLimiter = rateLimit({
    ...baseOptions,
    windowMs: 60 * 1000,
    max: 30,
});

// Baseline for the whole /api surface.
export const globalLimiter = rateLimit({
    ...baseOptions,
    windowMs: 60 * 1000,
    max: 200,
});

// /api/internal — machine-to-machine only, should see very low volume.
export const internalLimiter = rateLimit({
    ...baseOptions,
    windowMs: 60 * 1000,
    max: 10,
});
