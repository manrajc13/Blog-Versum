import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import helmet from "helmet";
import hpp from "hpp";
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
import internalRoutes from "./routes/internal.route.js";
import publicRoutes from "./routes/public.route.js";
import connectDB from "./lib/db.js";
import cookieParser from "cookie-parser";
import dns from "dns";
import { app, server } from "./lib/socket.js";
import mongoSanitize from "./middleware/mongoSanitize.js";
import { globalLimiter } from "./middleware/rateLimiters.js";
import { globalDailyBudget } from "./middleware/globalBudget.js";
import { requireXHR } from "./middleware/requireXHR.js";

const PORT = process.env.PORT;

// Origins allowed to make credentialed cross-origin requests. In the split
// deployment this is the Vercel frontend (e.g. https://blog-versum.vercel.app);
// locally it's http://localhost:5173. Comma-separate CLIENT_URL to allow more than
// one (e.g. a custom domain + the vercel.app fallback).
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Narrow matcher for this project's Vercel preview deployments. Left OFF by default —
// only the exact CLIENT_URL origins are allowed. Uncomment the use in corsOptions to
// let previews talk to this backend.
// const PREVIEW_ORIGIN = /^https:\/\/blog-versum-[\w-]+\.vercel\.app$/;

const corsOptions = {
  origin(origin, cb) {
    // No Origin header = same-origin or server-to-server (curl, health checks); allow.
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    // if (PREVIEW_ORIGIN.test(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

// Force IPv4 DNS resolution — fixes ENETUNREACH on Render (IPv6 not routable)
dns.setDefaultResultOrder('ipv4first');

// Single reverse proxy hop (nginx) in front of Express — needed so req.ip reflects
// the real client IP from X-Forwarded-For, which per-IP rate limiting depends on.
app.set("trust proxy", 1);

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());
// CSRF guard: mutating requests must carry the X-Requested-With header our axios
// client sets (skips safe methods and the api-key-protected /api/internal/*).
app.use(requireXHR);
app.use("/api", globalDailyBudget); // aggregate daily cost circuit-breaker (before per-IP)
app.use("/api", globalLimiter);     // per-IP baseline

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/search", searchRoute);
app.use("/api/profile", profileRoute);
app.use("/api/messages", messageRoutes);
app.use("/api/internal", internalRoutes);
app.use("/api/public", publicRoutes);


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});

// Docker sends SIGTERM on `docker stop` / `docker compose down`; exit cleanly
// instead of waiting to be SIGKILLed after the grace period.
process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully");
    server.close(() => process.exit(0));
});

// Catches anything routes/middleware pass to next(err) or throw synchronously;
// keeps unexpected errors from leaking stack traces/internals to clients.
app.use((err, req, res, next) => {
  console.error("Unhandled:", err);
  res.status(err.status || 500).json({ message: err.status ? err.message : "Internal Server Error" });
});