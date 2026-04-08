import express from "express";
import protectRoute from "../middleware/auth.middleware.js";

import {
    createComment,
    deleteComment,
    getCommentsByPost
} from "../controllers/comments.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createComment);
router.delete("/delete/:commentId", protectRoute, deleteComment);
router.get("/post/:postId", protectRoute, getCommentsByPost);

export default router;