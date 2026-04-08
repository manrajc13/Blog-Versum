import User from "../models/user.model.js";
import Follow from "../models/follow.model.js";
import AI_Author from "../models/ai.model.js";

export const followrequest = async (req, res) => {
    const { userId: tofollowId } = req.body;   // target user id
    const fromfollowId = req.user._id;
    const followingType = req.body.followingType || "user";

    try {

        //  Prevent self follow
        if (fromfollowId.toString() === tofollowId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        //  Prevent duplicate follow / request
        const existingFollow = await Follow.findOne({
            followerId: fromfollowId,
            followingId: tofollowId
        });

        if (existingFollow) {
            if (existingFollow.status === "pending") {
                return res.status(400).json({ message: "Follow request already pending" });
            }

            if (existingFollow.status === "accepted") {
                return res.status(400).json({ message: "You already follow this account" });
            }
        }

        // USER FOLLOW
        if (followingType === "user") {

            const user = await User.findById(tofollowId).select("isPrivate");

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            let status = user.isPrivate ? "pending" : "accepted";

            const follow = new Follow({
                followerId: fromfollowId,
                followingId: tofollowId,
                followingType: "user",
                status
            });

            await follow.save();

            // Update counts if auto accepted
            if (status === "accepted") {

                await User.findByIdAndUpdate(tofollowId, {
                    $inc: { followerCount: 1 }
                });

                await User.findByIdAndUpdate(fromfollowId, {
                    $inc: { followingCount: 1 }
                });
            }

            return res.status(200).json({
                message: status === "pending"
                    ? "Follow request sent"
                    : "Followed successfully"
            });

        } 
        
        // AI AUTHOR FOLLOW
        else {

            const follow = new Follow({
                followerId: fromfollowId,
                followingId: tofollowId,
                followingType: "AI",
                status: "accepted"
            });

            await follow.save();

            await AI_Author.findByIdAndUpdate(tofollowId, {
                $inc: { followerCount: 1 }
            });

            await User.findByIdAndUpdate(fromfollowId, {
                $inc: { followingCount: 1 }
            });

            return res.status(200).json({ message: "Followed successfully" });
        }

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



export const unfollow = async (req, res) => {
    const { userId: tounfollowId } = req.body;
    const fromunfollowId = req.user._id;
    const followingType = req.body.followingType || "user";

    try {

        const follow = await Follow.findOneAndDelete({
            followerId: fromunfollowId,
            followingId: tounfollowId,
            followingType
        });

        if (!follow) {
            return res.status(404).json({ message: "Follow relationship not found" });
        }

        if (follow.status === "accepted") {

            if (followingType === "user") {

                await User.findByIdAndUpdate(tounfollowId, {
                    $inc: { followerCount: -1 }
                });

            } else {

                await AI_Author.findByIdAndUpdate(tounfollowId, {
                    $inc: { followerCount: -1 }
                });

            }

            await User.findByIdAndUpdate(fromunfollowId, {
                $inc: { followingCount: -1 }
            });
        }

        res.status(200).json({ message: "Unfollowed successfully" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



export const acceptfollowRequest = async (req, res) => {
    const { userId: fromfollowId } = req.body;
    const tofollowId = req.user._id;

    try {

        const follow = await Follow.findOneAndUpdate(
            {
                followerId: fromfollowId,
                followingId: tofollowId,
                followingType: "user",
                status: "pending"
            },
            { status: "accepted" },
            { new: true }
        );

        if (!follow) {
            return res.status(404).json({ message: "Follow request not found" });
        }

        await User.findByIdAndUpdate(tofollowId, {
            $inc: { followerCount: 1 }
        });

        await User.findByIdAndUpdate(fromfollowId, {
            $inc: { followingCount: 1 }
        });

        res.status(200).json({ message: "Follow request accepted" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



export const rejectfollowRequest = async (req, res) => {
    const { userId: fromfollowId } = req.body;
    const tofollowId = req.user._id;

    try {

        const deleted = await Follow.findOneAndDelete({
            followerId: fromfollowId,
            followingId: tofollowId,
            followingType: "user",
            status: "pending"
        });

        if (!deleted) {
            return res.status(404).json({ message: "Follow request not found" });
        }

        res.status(200).json({ message: "Follow request rejected" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getFollowers = async (req, res) => {
    const userId = req.user._id;

    try {

        const followers = await Follow.find({
            followingId: userId,
            followingType: "user",
            status: "accepted"
        })
        .populate({ path: "followerId", model: "User", select: "username avatar" });

        const result = followers.map(f => f.followerId);

        res.status(200).json({ followers: result });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getFollowing = async (req, res) => {
    const userId = req.user._id;

    try {
        const following = await Follow.find({
            followerId: userId,
            status: "accepted"
        })
        .select("followingId followingType")
        .lean();

        const userIds = following
            .filter((entry) => entry.followingType === "user")
            .map((entry) => entry.followingId);

        const aiAuthorIds = following
            .filter((entry) => entry.followingType === "AI")
            .map((entry) => entry.followingId);

        const [users, aiAuthors] = await Promise.all([
            userIds.length
                ? User.find({ _id: { $in: userIds } }).select("_id username avatar").lean()
                : Promise.resolve([]),
            aiAuthorIds.length
                ? AI_Author.find({ _id: { $in: aiAuthorIds } }).select("_id name avatar").lean()
                : Promise.resolve([]),
        ]);

        const userMap = new Map(users.map((entry) => [entry._id.toString(), entry]));
        const aiMap = new Map(aiAuthors.map((entry) => [entry._id.toString(), entry]));

        const result = following
            .map((entry) => {
                const entryId = entry.followingId?.toString?.();
                if (!entryId) return null;

                if (entry.followingType === "AI") {
                    const ai = aiMap.get(entryId);
                    if (!ai) return null;
                    return {
                        _id: ai._id,
                        username: ai.name,
                        avatar: ai.avatar,
                        userType: "AI"
                    };
                }

                const user = userMap.get(entryId);
                if (!user) return null;
                return {
                    _id: user._id,
                    username: user.username,
                    avatar: user.avatar,
                    userType: "human"
                };
            })
            .filter(Boolean);

        res.status(200).json({ following: result });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getPendingFollowRequests = async (req, res) => {
    const userId = req.user._id;

    try {
        const me = await User.findById(userId).select("isPrivate").lean();

        if (!me || !me.isPrivate) {
            return res.status(200).json({ requests: [] });
        }

        const pending = await Follow.find({
            followingId: userId,
            followingType: "user",
            status: "pending"
        })
        .populate({ path: "followerId", model: "User", select: "_id username avatar" })
        .select("followerId createdAt")
        .lean();

        const requests = pending
            .map((entry) => {
                const follower = entry.followerId;
                if (!follower) return null;

                return {
                    _id: follower._id,
                    username: follower.username,
                    avatar: follower.avatar,
                    requestedAt: entry.createdAt,
                };
            })
            .filter(Boolean);

        res.status(200).json({ requests });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};