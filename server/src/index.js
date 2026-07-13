import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
dotenv.config();

import authRoutes from './routes/auth.route.js';
import followRoutes from "./routes/follow.route.js";
import likeRoutes from "./routes/likes.route.js";
import postRoutes from "./routes/posts.route.js";
import feedRoutes from "./routes/feed.route.js";
import commentRoutes from "./routes/comments.route.js";
import searchRoute from "./routes/search.route.js";
import profileRoute from "./routes/profile.route.js";
import messageRoutes from "./routes/message.route.js";
import connectDB from "./lib/db.js";
import cookieParser from "cookie-parser";
import dns from "dns";
import { app, server } from "./lib/socket.js";

const PORT = process.env.PORT;

// Force IPv4 DNS resolution — fixes ENETUNREACH on Render (IPv6 not routable)
dns.setDefaultResultOrder('ipv4first');

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/search", searchRoute);
app.use("/api/profile", profileRoute);
app.use("/api/messages", messageRoutes);


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});