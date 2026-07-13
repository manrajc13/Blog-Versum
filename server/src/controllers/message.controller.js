import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Follow from "../models/follow.model.js";
import cloudinary from "../lib/cloudinary.js";
import {getReceiverSocketId, io} from "../lib/socket.js";

export const getUsersForSidebar = async(req, res) => {
    try{
        const loggedInUserId = req.user._id;
        const conversations = await Message.find({
            $or: [
                {senderId: loggedInUserId},
                {receiverId: loggedInUserId}
            ]
        })
        .populate([
            { path: "senderId", select: "_id username fullname avatar" },
            { path: "receiverId", select: "_id username fullname avatar" }
        ])
        .lean();

        const chattedUsers = conversations
            .flatMap((message) => [message.senderId, message.receiverId])
            .filter((user) => user && user._id?.toString() !== loggedInUserId.toString());

        const users = [...new Map(chattedUsers.map((user) => [user._id.toString(), user])).values()];

        res.status(200).json(users);
    } catch (error){
        console.log("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const getUsersToChatWith = async(req, res) => {
    try{
        const loggedInUserId = req.user._id;
        const acceptedFollows = await Follow.find({
            $or: [
                { followerId: loggedInUserId, status: "accepted", followingType: "user" },
                { followingId: loggedInUserId, status: "accepted", followingType: "user" }
            ]
        })
        .populate([
            { path: "followerId", select: "_id username fullname avatar" },
            { path: "followingId", select: "_id username fullname avatar" }
        ])
        .lean();

        const usersToChatWith = [...new Map(
            acceptedFollows
                .map((follow) => (follow.followerId._id.toString() === loggedInUserId.toString()
                    ? follow.followingId
                    : follow.followerId))
                .filter((user) => user)
                .map((user) => [user._id.toString(), user])
        ).values()];

        res.status(200).json(usersToChatWith);
    } catch (error) {
        console.log("Error in getUsersToChatWith controller ", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const getMessages = async(req, res) => {
    try{
        const {id:userToChatId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId:myId, receiverId: userToChatId},
                {senderId:userToChatId, receiverId: myId}
            ]
        });

        res.status(200).json(messages);
    } catch(error) {
        console.log("Error in getMessages controller ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}


export const sendMessage = async (req, res) => {
    try{
        const {text, image} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        //todo: realtime functionality goes here => socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
        
    } catch (error) {
        console.log("Error in sendMessage controller ", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
} 