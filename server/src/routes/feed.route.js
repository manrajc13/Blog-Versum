import express from "express";
import protectRoute from "../middleware/auth.middleware.js";

import {
    getFollowingFeed,
    getRecommendedFeed,
    getTrendingFeed
} from "../controllers/feed.controller.js";

const router = express.Router();

router.get("/following", protectRoute, getFollowingFeed);
router.get("/recommended", protectRoute, getRecommendedFeed);
router.get("/trending", protectRoute, getTrendingFeed);

export default router;