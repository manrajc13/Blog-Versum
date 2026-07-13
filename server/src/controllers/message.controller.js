import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Follow from "../models/follow.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

const conversationPopulatedFields = [
    { path: "participants", select: "username fullname avatar" },
    { path: "lastMessage", populate: { path: "senderId", select: "username fullname avatar" } }
];

const getConversationBetweenUsers = async (firstUserId, secondUserId) => {
    return Conversation.findOne({
        participants: {
            $all: [firstUserId, secondUserId],
            $size: 2
        }
    });
};


const buildConversationResponse = (conversation, currentUserId) => {
    const plainConversation = conversation.toObject ? conversation.toObject() : conversation;
    const participants = Array.isArray(plainConversation.participants)
        ? plainConversation.participants
        : [];

    return {
        ...plainConversation,
        otherParticipant: participants.find(
            (participant) => participant?._id?.toString() !== currentUserId.toString()
        ) || null
    };
};

// Messaging is only allowed between users who follow each other in at least
// one direction (accepted follower or following relationship).
const canMessageEachOther = async (userIdA, userIdB) => {
    const connection = await Follow.findOne({
        followingType: "user",
        status: "accepted",
        $or: [
            { followerId: userIdA, followingId: userIdB },
            { followerId: userIdB, followingId: userIdA }
        ]
    }).lean();

    return Boolean(connection);
};

const getStoredChatImageUrl = async (image) => {
    if (!image) {
        return null;
    }

    if (typeof image === "string" && /^https?:\/\//i.test(image)) {
        return image;
    }

    const uploadResponse = await cloudinary.uploader.upload(image);
    return uploadResponse.secure_url;
};

export const sendMessage = async (req, res) => {
    const senderId = req.user._id;
    const { receiverId } = req.params;
    const { text = "", image = null, messageType } = req.body || {};

    try {
        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: "Invalid receiver" });
        }

        if (!String(text).trim() && !image) {
            return res.status(400).json({ message: "Message text or image is required" });
        }

        if (senderId.toString() === receiverId.toString()) {
            return res.status(400).json({ message: "You cannot message yourself" });
        }

        const receiver = await User.findById(receiverId).select("_id username fullname avatar").lean();
        if (!receiver) {
            return res.status(404).json({ message: "Receiver not found" });
        }

        if (!(await canMessageEachOther(senderId, receiverId))) {
            return res.status(403).json({ message: "You can only message users who follow you or whom you follow" });
        }

        const imageUrl = await getStoredChatImageUrl(image);

        let conversation = await getConversationBetweenUsers(senderId, receiverId);

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
                lastMessageText: "",
                lastMessageAt: new Date()
            });
        }

        const trimmedText = String(text).trim();
        const resolvedMessageType = messageType || (image ? "image" : "text");

        const message = await Message.create({
            conversationId: conversation._id,
            senderId,
            text: trimmedText,
            image: imageUrl,
            messageType: resolvedMessageType || (imageUrl ? "image" : "text")
        });

        conversation.lastMessage = message._id;
        conversation.lastMessageText = trimmedText || (imageUrl ? "Image" : "");
        conversation.lastMessageAt = message.createdAt;
        await conversation.save();

        const populatedMessage = await Message.findById(message._id)
            .populate("senderId", "username fullname avatar")
            .lean();

        const populatedConversation = await Conversation.findById(conversation._id)
            .populate(conversationPopulatedFields)
            .lean();

        // Same payload to both sockets — the client resolves "who's on the
        // other end" itself from senderId/receiverId, so there's no
        // per-recipient computation here that can get the direction wrong.
        const socketPayload = {
            message: populatedMessage,
            senderId: senderId.toString(),
            receiverId: receiverId.toString()
        };

        const receiverSocketId = getReceiverSocketId(receiverId.toString());
        const senderSocketId = getReceiverSocketId(senderId.toString());

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", socketPayload);
        }

        if (senderSocketId && senderSocketId !== receiverSocketId) {
            io.to(senderSocketId).emit("newMessage", socketPayload);
        }

        return res.status(201).json({
            message: populatedMessage,
            conversation: buildConversationResponse(populatedConversation, senderId)
        });
    } catch (error) {
        console.log("Error sending message", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getConversations = async (req, res) => {
    const userId = req.user._id;

    try {
        const conversations = await Conversation.find({
            participants: userId
        })
            .populate(conversationPopulatedFields)
            .sort({ lastMessageAt: -1 })
            .lean();

        return res.status(200).json(
            conversations.map((conversation) => buildConversationResponse(conversation, userId))
        );
    } catch (error) {
        console.log("Error fetching conversations", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getConversationWithUser = async (req, res) => {
    const userId = req.user._id;
    const { userId: otherUserId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
            return res.status(400).json({ message: "Invalid user" });
        }

        if (userId.toString() === otherUserId.toString()) {
            return res.status(400).json({ message: "You cannot message yourself" });
        }

        const otherUser = await User.findById(otherUserId).select("_id username fullname avatar").lean();
        if (!otherUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!(await canMessageEachOther(userId, otherUserId))) {
            return res.status(403).json({ message: "You can only message users who follow you or whom you follow" });
        }

        let conversation = await getConversationBetweenUsers(userId, otherUserId);

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [userId, otherUserId],
                lastMessageText: "",
                lastMessageAt: new Date()
            });
        }

        const messages = await Message.find({
            conversationId: conversation._id,
            isDeleted: false
        })
            .populate("senderId", "username fullname avatar")
            .sort({ createdAt: 1 })
            .lean();

        const populatedConversation = await Conversation.findById(conversation._id)
            .populate(conversationPopulatedFields)
            .lean();

        return res.status(200).json({
            conversation: buildConversationResponse(populatedConversation, userId),
            messages
        });
    } catch (error) {
        console.log("Error fetching conversation", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getMessagesByConversation = async (req, res) => {
    const userId = req.user._id;
    const { conversationId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ message: "Invalid conversation" });
        }

        const conversation = await Conversation.findById(conversationId)
            .populate(conversationPopulatedFields)
            .lean();

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        const isParticipant = conversation.participants.some(
            (participant) => participant?._id?.toString() === userId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const messages = await Message.find({
            conversationId,
            isDeleted: false
        })
            .populate("senderId", "username fullname avatar")
            .sort({ createdAt: 1 })
            .lean();

        return res.status(200).json({
            conversation: buildConversationResponse(conversation, userId),
            messages
        });
    } catch (error) {
        console.log("Error fetching messages", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};