import express from 'express';
import {signup, login, logout, checkAuth, updateProfile, updateTheme, updateProfileSection, getProfileInfo} from "../controllers/auth.controller.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);
router.put("/update-theme", protectRoute, updateTheme);
router.put("/update-profile-section", protectRoute, updateProfileSection);
 
router.get("/check", protectRoute, checkAuth);
router.get("/profile-info", protectRoute, getProfileInfo);

export default router;