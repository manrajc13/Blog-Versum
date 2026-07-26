import express from "express";
import internalApiAuth from "../middleware/internalApiAuth.js";
import { createInternalPost } from "../controllers/internal.controller.js";
import { internalLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

// Every route here is gated by the shared-secret API key (not JWT).
// Mounted at /api/internal in index.js -> POST /api/internal/posts
router.post("/posts", internalLimiter, internalApiAuth, createInternalPost);

export default router;
