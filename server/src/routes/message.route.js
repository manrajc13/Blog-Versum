import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import {
    getMessages,
    getUsersForSidebar,
    getUsersToChatWith,
    sendMessage
} from "../controllers/message.controller.js";
import { writeLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/users-to-chat-with", protectRoute, getUsersToChatWith);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, writeLimiter, sendMessage);

export default router;