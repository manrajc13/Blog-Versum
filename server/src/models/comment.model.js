import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
{
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
        index: true
    },

    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    content: {
        type: String,
        required: true,
        trim: true
    },

    parentCommentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    }
},
{
    timestamps: { createdAt: true, updatedAt: false }
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;