import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import {
  followrequest,
  unfollow,
  acceptfollowRequest,
  rejectfollowRequest,
    getFollowers,
  getFollowing,
  getPendingFollowRequests
} from "../controllers/follow.controller.js";

const router = express.Router();

router.post("/request", protectRoute, followrequest);
router.post("/unfollow", protectRoute, unfollow);
router.post("/accept", protectRoute, acceptfollowRequest);
router.post("/reject", protectRoute, rejectfollowRequest);
router.get("/followers", protectRoute, getFollowers);
router.get("/following", protectRoute, getFollowing);
router.get("/pending", protectRoute, getPendingFollowRequests);

export default router;