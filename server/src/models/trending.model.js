import mongoose from "mongoose";

const trendingSchema = new mongoose.Schema(
{
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
        unique: true
    },

    score: {
        type: Number,
        required: true,
        default: 0
    },

    computedAt: {
        type: Date,
        default: Date.now
    }
});

const Trending = mongoose.model("Trending", trendingSchema);

export default Trending;