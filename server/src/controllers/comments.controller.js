import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";



export const createComment = async (req, res) => {

    const userId = req.user._id;

    try {

        const { postId, content, parentCommentId = null } = req.body;

        if (!content) {
            return res.status(400).json({
                message: "Comment content is required"
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comment = new Comment({
            postId,
            authorId: userId,
            content,
            parentCommentId
        });

        await comment.save();

        // Increment comment count on post
        await Post.findByIdAndUpdate(postId, {
            $inc: { commentCount: 1 }
        });

        const populatedComment = await Comment.findById(comment._id)
            .populate("authorId", "username avatar");

        res.status(201).json(populatedComment);

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};




export const deleteComment = async (req, res) => {

    const userId = req.user._id;
    const { commentId } = req.params;

    try {

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        // Check if the user is the post author
        const post = await Post.findById(comment.postId).select('authorId');

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.authorId.toString() !== userId.toString()) {
            return res.status(401).json({
                message: "Only post authors can delete comments from their post."
            });
        }

        // Count how many child comments (replies) this comment has
        const childCommentCount = await Comment.countDocuments({ parentCommentId: commentId });

        // Delete all child comments (replies) first
        await Comment.deleteMany({ parentCommentId: commentId });

        // Delete the parent comment
        await Comment.findByIdAndDelete(commentId);

        // Calculate total comments deleted (parent + children)
        const totalDeleted = 1 + childCommentCount;

        // Decrement post's commentCount by total deleted
        await Post.findByIdAndUpdate(comment.postId, {
            $inc: { commentCount: -totalDeleted }
        });

        res.status(200).json({
            message: "Comment deleted successfully",
            deletedCount: totalDeleted
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};




export const getCommentsByPost = async (req, res) => {

    const { postId } = req.params;

    try {

        const comments = await Comment.find({
            postId
        })
        .populate("authorId", "username avatar")
        .sort({ createdAt: 1 });

        res.status(200).json(comments);

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};