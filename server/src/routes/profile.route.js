import express from "express";
import protectRoute  from "../middleware/auth.middleware.js"; 
import User from "../models/user.model.js";
import Follow from "../models/follow.model.js";
import Post from "../models/post.model.js";
import AI_Author from "../models/ai.model.js";

const router = express.Router();

router.get("/me", protectRoute, async (req, res) => {
    const viewerId = req.user?._id;

    try {
        const me = await User.findById(viewerId)
            .select("_id username email avatar followerCount followingCount numberofBlogs")
            .lean();

        if (!me) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: {
                _id: me._id,
                username: me.username,
                email: me.email,
                avatar: me.avatar,
                followerCount: me.followerCount ?? 0,
                followingCount: me.followingCount ?? 0,
                numberofBlogs: me.numberofBlogs ?? 0,
            },
        });
    } catch (error) {
        console.log("Error fetching self profile basics", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/:identifier", protectRoute, async (req, res) => {
    const { identifier } = req.params;
    const viewerId = req.user?._id;
    const userType = (req.query.userType || "human").toString().toLowerCase();
    try {
        if (userType === "ai") {
            const decodedIdentifier = decodeURIComponent(identifier);

            const escapedName = decodedIdentifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const aiAuthor = await AI_Author.findOne({
                name: { $regex: new RegExp(`^${escapedName}$`, "i") }
            })
                .select("_id name avatar bio followerCount postCount createdAt")
                .lean();

            if (!aiAuthor) {
                return res.status(404).json({ message: "AI author not found" });
            }

            const followRelation = await Follow.findOne({
                followerId: viewerId,
                followingId: aiAuthor._id,
                followingType: "AI"
            }).select("status").lean();

            const aiFollowStatus = followRelation?.status || "none";

            const posts = await Post.find({
                authorId: aiAuthor._id,
                authorType: "AI",
                published: true,
                visibility: "public"
            }).lean();

            return res.status(200).json({
                message: {
                    user: {
                        _id: aiAuthor._id,
                        name: aiAuthor.name,
                        avatar: aiAuthor.avatar,
                        bio: aiAuthor.bio,
                        followerCount: aiAuthor.followerCount ?? 0,
                        followingCount: 0,
                        numberofBlogs: aiAuthor.postCount ?? posts.length,
                        createdAt: aiAuthor.createdAt,
                        isPrivate: false,
                        followStatus: aiFollowStatus,
                        isFollowing: aiFollowStatus === "accepted" ? true : aiFollowStatus === "pending" ? "pending" : false,
                        userType: "AI"
                    },
                    blogs: posts
                }
            });
        }

        const user = await User.findOne({ username: identifier }).select("_id username fullname avatar email numberofBlogs followerCount followingCount createdAt isPrivate");
        if (!user || user.length === 0) {
            return res.status(404).json({message: "User not found"});
        }
        let visibilityAllowed = ["public"];

        const follow = await Follow.findOne({
            followerId: viewerId,
            followingId: user._id,
            followingType: "user"
        }).select("status").lean();

        const followStatus = follow?.status || "none";

        if (follow?.status === "accepted"){
            visibilityAllowed.push("followers");
        }

        const posts = await Post.find({
            authorId: user._id,
            authorType: "human",
            published: true,
            visibility: { $in: visibilityAllowed }
        });

        const normalizedUser = {
            ...user.toObject(),
            followStatus,
            isFollowing: followStatus === "accepted" ? true : followStatus === "pending" ? "pending" : false,
            userType: "human"
        };

        res.status(200).json({message : {user: normalizedUser, blogs: posts}});
    } catch (error) {
        console.log("Error fetching profile data ", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
});

export default router;