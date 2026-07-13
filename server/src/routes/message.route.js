import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import {
    getConversationWithUser,
    getConversations,
    getMessagesByConversation,
    sendMessage
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/conversations", protectRoute, getConversations);
router.get("/with/:userId", protectRoute, getConversationWithUser);
router.get("/conversation/:conversationId", protectRoute, getMessagesByConversation);
router.post("/send/:receiverId", protectRoute, sendMessage);

export default router;