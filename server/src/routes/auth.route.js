import express from 'express';
import {signup, login, logout, checkAuth, verifyEmailOTP, sendOTP, forgotPassword, verifyResetOTP, resetPassword, updateProfile, updateTheme, updateProfileSection, getProfileInfo} from "../controllers/auth.controller.js";
import protectRoute from "../middleware/auth.middleware.js";
import { authLimiter, otpLimiter, writeLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/logout", logout);

router.post("/verify-email", authLimiter, verifyEmailOTP);
router.post("/send-otp", otpLimiter, sendOTP);

// Password reset — forgot-password emails an OTP (abusable → strict otpLimiter);
// verify/reset only check a code the caller already holds (authLimiter).
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/verify-reset-otp", authLimiter, verifyResetOTP);
router.post("/reset-password", authLimiter, resetPassword);

router.put("/update-profile", protectRoute, writeLimiter, updateProfile);
router.put("/update-theme", protectRoute, updateTheme);
router.put("/update-profile-section", protectRoute, writeLimiter, updateProfileSection);
 
router.get("/check", protectRoute, checkAuth);
router.get("/profile-info", protectRoute, getProfileInfo);

export default router;