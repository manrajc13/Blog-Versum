import Like    from "../models/like.model.js";
import Comment from "../models/comment.model.js";
import Post    from "../models/post.model.js";
import { likesMatrix, commentsData } from "./mockdata/interactions.mock.js";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: fuzzy post lookup by partial title (case-insensitive)
// ─────────────────────────────────────────────────────────────────────────────
function findPost(posts, titleSubstring) {
  const lower = titleSubstring.toLowerCase();
  return posts.find((p) => p.title.toLowerCase().includes(lower));
}

export async function seedInteractions(users, posts) {
  const userMap = Object.fromEntries(users.map((u) => [u.username, u]));

  // ── LIKES ─────────────────────────────────────────────────────────────────
  console.log("--- Seeding Likes ---");

  let likeCount = 0;

  for (const entry of likesMatrix) {
    const user = userMap[entry.user];
    if (!user) {
      console.warn(`  [WARN] User "${entry.user}" not found, skipping likes.`);
      continue;
    }

    for (const titleSub of entry.likes) {
      const post = findPost(posts, titleSub);
      if (!post) {
        console.warn(`  [WARN] Post matching "${titleSub}" not found, skipping like.`);
        continue;
      }

      const existing = await Like.findOne({ userId: user._id, postId: post._id });
      if (existing) continue;

      await Like.create({ userId: user._id, postId: post._id });
      await Post.findByIdAndUpdate(post._id, { $inc: { likeCount: 1 } });
      likeCount++;
    }
  }

  console.log(`  Total likes created: ${likeCount}\n`);

  // ── COMMENTS ──────────────────────────────────────────────────────────────
  console.log("--- Seeding Comments ---");

  // Cache: "postId:commenter_username" → comment document (for reply linking)
  const commentCache = {};
  let commentCount = 0;

  // ── First pass: top-level comments (isReplyTo is null/undefined) ──────────
  for (const entry of commentsData) {
    if (entry.isReplyTo) continue;

    const user = userMap[entry.commenter];
    if (!user) {
      console.warn(`  [WARN] Commenter "${entry.commenter}" not found, skipping.`);
      continue;
    }

    const post = findPost(posts, entry.postTitle);
    if (!post) {
      console.warn(`  [WARN] Post matching "${entry.postTitle}" not found, skipping comment.`);
      continue;
    }

    // Dedup by content + author + post
    const existing = await Comment.findOne({
      postId:   post._id,
      authorId: user._id,
      content:  entry.content,
    });

    if (existing) {
      commentCache[`${post._id}:${entry.commenter}`] = existing;
      continue;
    }

    const comment = await Comment.create({
      postId:   post._id,
      authorId: user._id,
      content:  entry.content,
    });

    await Post.findByIdAndUpdate(post._id, { $inc: { commentCount: 1 } });

    commentCache[`${post._id}:${entry.commenter}`] = comment;
    commentCount++;
    console.log(`  ${entry.commenter} on "${entry.postTitle.slice(0, 40)}": "${entry.content.slice(0, 50)}..."`);
  }

  // ── Second pass: replies ──────────────────────────────────────────────────
  for (const entry of commentsData) {
    if (!entry.isReplyTo) continue;

    const user = userMap[entry.commenter];
    if (!user) continue;

    const post = findPost(posts, entry.postTitle);
    if (!post) continue;

    const parentComment = commentCache[`${post._id}:${entry.isReplyTo}`] ?? null;

    const existing = await Comment.findOne({
      postId:   post._id,
      authorId: user._id,
      content:  entry.content,
    });
    if (existing) continue;

    await Comment.create({
      postId:          post._id,
      authorId:        user._id,
      content:         entry.content,
      parentCommentId: parentComment ? parentComment._id : null,
    });

    await Post.findByIdAndUpdate(post._id, { $inc: { commentCount: 1 } });
    commentCount++;

    const replyLabel = parentComment ? `(reply to ${entry.isReplyTo})` : "";
    console.log(`  ${entry.commenter} on "${entry.postTitle.slice(0, 40)}" ${replyLabel}: "${entry.content.slice(0, 50)}..."`);
  }

  console.log(`  Total comments created: ${commentCount}\n`);
}
