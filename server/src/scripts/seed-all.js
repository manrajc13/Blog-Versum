import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { seedUsers, seedAIAuthors } from "./seed-users.js";
import { seedPosts }                from "./seed-posts.js";
import { seedFollows }              from "./seed-follows.js";
import { seedInteractions }         from "./seed-interactions.js";

async function seedAll() {
  try {
    console.log("=== Connecting to MongoDB ===");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to: ${mongoose.connection.host}\n`);

    // Step 1 ── Users & AI Authors
    const users     = await seedUsers();
    const aiAuthors = await seedAIAuthors();

    // Step 2 ── Posts (human + AI)
    const posts = await seedPosts(users, aiAuthors);

    // Step 3 ── Follow relationships
    await seedFollows(users, aiAuthors);

    // Step 4 ── Likes & Comments
    await seedInteractions(users, posts);

    // ── Summary ───────────────────────────────────────────────────────────
    console.log("=== Seeding Complete ===");
    console.log(`  Users:      ${users.length}`);
    console.log(`  AI Authors: ${aiAuthors.length}`);
    console.log(`  Posts:      ${posts.length}`);
    console.log("  (See above for follow, like, and comment counts)");
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  }
}

seedAll();
