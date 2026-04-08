import Follow from "../models/follow.model.js";
import User from "../models/user.model.js";
import AI_Author from "../models/ai.model.js";
import { followMatrix } from "./mockdata/follows.mock.js";

export async function seedFollows(users, aiAuthors) {
  console.log("--- Seeding Follows ---");

  // Build lookup maps
  const userMap = Object.fromEntries(users.map((u) => [u.username, u]));
  const aiMap   = Object.fromEntries(aiAuthors.map((a) => [a.name, a]));

  // Accumulate follower/following count deltas before batch-writing
  const counterDeltas = {}; // { docId: { followerCount, followingCount } }

  function inc(id, field) {
    const key = id.toString();
    if (!counterDeltas[key]) counterDeltas[key] = { followerCount: 0, followingCount: 0 };
    counterDeltas[key][field]++;
  }

  let acceptedCount = 0;
  let pendingCount  = 0;

  for (const entry of followMatrix) {
    const follower = userMap[entry.follower];
    if (!follower) {
      console.warn(`  [WARN] Follower "${entry.follower}" not found, skipping.`);
      continue;
    }

    // Resolve target id
    let followingId;
    if (entry.type === "AI") {
      const ai = aiMap[entry.targetAI];
      if (!ai) {
        console.warn(`  [WARN] AI author "${entry.targetAI}" not found, skipping.`);
        continue;
      }
      followingId = ai._id;
    } else {
      const target = userMap[entry.target];
      if (!target) {
        console.warn(`  [WARN] Target user "${entry.target}" not found, skipping.`);
        continue;
      }
      followingId = target._id;
    }

    // Determine status
    let status;
    if (entry.forceStatus) {
      status = entry.forceStatus;
    } else if (entry.type === "AI") {
      status = "accepted"; // AI authors are always public
    } else {
      const target = userMap[entry.target];
      status = target.isPrivate ? "pending" : "accepted";
    }

    // Dedup check
    const existing = await Follow.findOne({ followerId: follower._id, followingId });
    if (existing) {
      status === "accepted" ? acceptedCount++ : pendingCount++;
      continue;
    }

    await Follow.create({
      followerId: follower._id,
      followingId,
      followingType: entry.type,
      status,
    });

    const targetLabel = entry.type === "AI" ? `AI:${entry.targetAI}` : entry.target;
    console.log(`  ${entry.follower} → ${targetLabel} [${status}]`);

    if (status === "accepted") {
      acceptedCount++;
      inc(follower._id, "followingCount");
      inc(followingId, "followerCount");
    } else {
      pendingCount++;
    }
  }

  // ── Batch-write counter updates ───────────────────────────────────────────
  for (const [id, deltas] of Object.entries(counterDeltas)) {
    // Try User first; fall back to AI_Author (AI docs only have followerCount)
    const updated = await User.findByIdAndUpdate(id, {
      $inc: {
        followerCount:  deltas.followerCount,
        followingCount: deltas.followingCount,
      },
    });

    if (!updated) {
      await AI_Author.findByIdAndUpdate(id, {
        $inc: { followerCount: deltas.followerCount },
      });
    }
  }

  console.log(`  Accepted: ${acceptedCount}, Pending: ${pendingCount}\n`);
}
