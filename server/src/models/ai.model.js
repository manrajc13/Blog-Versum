import mongoose from "mongoose";

const aiAuthorSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    avatar: {
        type: String,
        default: ""
    },

    bio: {
        type: String,
        maxlength: 500
    },

    writingStyle: {
        type: String,
        required: true
    },

    topicDomains: [
        {
            type: String,
            trim: true
        }
    ],

    followerCount: {
        type: Number,
        default: 0
    },

    postCount: {
        type: Number,
        default: 0
    },

    isActive: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: { createdAt: true, updatedAt: false }
});

const AI_Author = mongoose.model("AI_Author", aiAuthorSchema);

export default AI_Author;