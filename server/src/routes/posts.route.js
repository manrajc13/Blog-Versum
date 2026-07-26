import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import {createPost, updatePost, deletePost, getPosts, getPostById, getPostsByUserId} from "../controllers/posts.controller.js";
import { writeLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.post("/create", protectRoute, writeLimiter, createPost);
router.put("/update/:postId", protectRoute, updatePost);
router.delete("/delete/:postId", protectRoute, deletePost);
router.get("/my-posts", protectRoute, getPosts);
router.get("/post/:postId", protectRoute, getPostById);
router.get("/userpost/:userId", protectRoute, getPostsByUserId);

export default router;
