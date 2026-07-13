import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },

        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        text: {
            type: String,
            trim: true,
            default: "",
        },

        image: {
            type: String, // Public URL (Cloudinary, S3, etc.)
            default: null,
        },

        messageType: {
            type: String,
            enum: ["text", "image"],
            required: true,
        },

        status: {
            type: String,
            enum: ["sent", "delivered", "read"],
            default: "sent",
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Fetch messages of a conversation efficiently
messageSchema.index({
    conversationId: 1,
    createdAt: 1,
});

// Fetch all messages sent by a user (analytics/moderation/debugging)
messageSchema.index({
    senderId: 1,
});

// Optional: quickly find unread messages if you later
// add receiver-specific read tracking.
// messageSchema.index({
//     conversationId: 1,
//     status: 1,
// });

const Message = mongoose.model("Message", messageSchema);

export default Message;