import Like from "../models/like.model.js";
import Post from "../models/post.model.js";



export const likePost = async (req, res) => {

    const userId = req.user._id;
    const { postId } = req.params;

    try {

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        // Prevent duplicate likes
        const existingLike = await Like.findOne({
            userId,
            postId
        });

        if (existingLike) {
            return res.status(400).json({
                message: "You already liked this post"
            });
        }

        const like = new Like({
            userId,
            postId
        });

        await like.save();

        // Increment like count
        await Post.findByIdAndUpdate(postId, {
            $inc: { likeCount: 1 }
        });

        res.status(200).json({
            message: "Post liked successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};




export const unlikePost = async (req, res) => {

    const userId = req.user._id;
    const { postId } = req.params;

    try {

        const like = await Like.findOneAndDelete({
            userId,
            postId
        });

        if (!like) {
            return res.status(400).json({
                message: "You have not liked this post"
            });
        }

        // Decrement like count
        await Post.findByIdAndUpdate(postId, {
            $inc: { likeCount: -1 }
        });

        res.status(200).json({
            message: "Post unliked successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};


export const hasLikedPost = async (req, res) => {
    const userId = req.user._id;
    const { postId } = req.params;

    try {
        const like = await Like.findOne({
            userId,
            postId
        });

        return res.status(200).json({ hasLiked: Boolean(like) });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}