import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true,
        trim: true
    },

    content: {
        type: mongoose.Schema.Types.Mixed, // rich text JSON
        required: true
    },

    catchline: {
        type: String,
        required: true,
    },

    coverImage: {
        type: String,
        default: ""
    },

    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    authorType: {
        type: String,
        enum: ["human", "AI"],
        default: "human"
    },

    visibility: {
        type: String,
        enum: ["public", "followers", "private"],
        default: "public"
    },

    tags: [
        {
            type: String,
            trim: true
        }
    ],

    readTime: {
        type: Number, // minutes
        default: 0
    },

    likeCount: {
        type: Number,
        default: 0
    },

    commentCount: {
        type: Number,
        default: 0
    },
    slug: {
        type: String,
        unique: true
    },

    published: {
        type: Boolean,
        default: true
    },
    fontId: {
        type: String,
        default: "serif"
    }
},
{
    timestamps: true
});

const Post = mongoose.model("Post", postSchema);

export default Post;