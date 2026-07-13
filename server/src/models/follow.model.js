import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
{
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    followingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    followingType: {
        type: String,
        enum: ["user", "AI"],
        default: "user"
    },

    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    }
},
{
    timestamps: { createdAt: true, updatedAt: false }
});

followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

const Follow = mongoose.model("Follow", followSchema);

export default Follow;