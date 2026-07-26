import express from "express";
import { publicLimiter } from "../middleware/rateLimiters.js";
import { getPublicCreators, getPublicStories } from "../controllers/public.controller.js";

/*
Public, unauthenticated discovery routes. No protectRoute guard by design — these
back the logged-out landing pages. The dedicated publicLimiter caps anonymous
per-IP volume on top of the global limiter.
*/
const router = express.Router();

router.use(publicLimiter);

router.get("/creators", getPublicCreators);
router.get("/stories", getPublicStories);

export default router;
