import express from "express";
import protectRoute from "../middleware/auth.middleware.js";

import {
    likePost,
    unlikePost,
    hasLikedPost
} from "../controllers/likes.controller.js";

const router = express.Router();

router.post("/like/:postId", protectRoute, likePost);
router.delete("/unlike/:postId", protectRoute, unlikePost);
router.get('/hasliked/:postId', protectRoute, hasLikedPost);

export default router;