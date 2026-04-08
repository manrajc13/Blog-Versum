import Post from "../models/post.model.js";
import AI_Author from "../models/ai.model.js";
import { generateSlug } from "../lib/utils/slugify.js";
import { humanPostsMap, aiPostsMap } from "./mockdata/posts.mock.js";

async function uniqueSlug(title) {
  const base = generateSlug(title);
  let slug = base;
  let counter = 1;
  while (await Post.exists({ slug })) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

export async function seedPosts(users, aiAuthors) {
  console.log("--- Seeding Posts ---");

  const createdPosts = [];
  let humanCount = 0;
  let aiCount = 0;

  // ── Human posts ───────────────────────────────────────────────────────────
  for (const user of users) {
    const postsData = humanPostsMap[user.username];
    if (!postsData) continue;

    for (const data of postsData) {
      const slug = await uniqueSlug(data.title);

      // Dedup by slug
      const existing = await Post.findOne({ slug });
      if (existing) {
        console.log(`  Post "${data.title}" already exists, skipping.`);
        createdPosts.push(existing);
        continue;
      }

      const post = await Post.create({
        ...data,
        slug,
        authorId: user._id,
        authorType: "human",
        published: true,
        catchline: data.catchline ?? "",
      });

      console.log(`  [${user.username}] "${post.title}"`);
      createdPosts.push(post);
      humanCount++;
    }

    // Update user's blog count
    await user.updateOne({ numberofBlogs: humanCount });
  }

  // ── AI posts ──────────────────────────────────────────────────────────────
  for (const author of aiAuthors) {
    const postsData = aiPostsMap[author.name];
    if (!postsData) continue;

    let authorPostCount = 0;

    for (const data of postsData) {
      const slug = await uniqueSlug(data.title);

      const existing = await Post.findOne({ slug });
      if (existing) {
        console.log(`  Post "${data.title}" already exists, skipping.`);
        createdPosts.push(existing);
        authorPostCount++;
        continue;
      }

      const post = await Post.create({
        ...data,
        slug,
        authorId: author._id,
        authorType: "AI",
        published: true,
        catchline: data.catchline ?? "",
      });

      console.log(`  [AI: ${author.name}] "${post.title}"`);
      createdPosts.push(post);
      aiCount++;
      authorPostCount++;
    }

    // Sync postCount on the AI author document
    await AI_Author.findByIdAndUpdate(author._id, { postCount: authorPostCount });
  }

  console.log(`  Human posts: ${humanCount}, AI posts: ${aiCount}\n`);
  return createdPosts;
}
