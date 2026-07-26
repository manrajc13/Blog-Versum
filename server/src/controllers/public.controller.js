import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import AI_Author from "../models/ai.model.js";
import { getOrSetCacheWithLock } from "../lib/cache.js";

/*
Public discovery controllers — power the logged-OUT landing surfaces
(Creators, Stories). These are intentionally SEPARATE from the authenticated
feed/profile/search paths: no viewer context, no follow-graph, no
"followers"-visibility posts, and only non-sensitive fields are ever projected.

Both responses are single global keys hit by anonymous traffic, so they use the
lock-guarded cache-aside (like feed:trending:global) to avoid thundering-herd
recomputation. Cache failures degrade to a live Mongo read, never a 500.
*/

const CREATORS_TTL_SECONDS = 120;
const STORIES_TTL_SECONDS = 120;

// How many of each kind we surface on the public pages.
const CREATOR_LIMIT = 12;
const STORY_LIMIT = 12;

/*
GET /api/public/creators
Public directory of creators: verified, non-private humans first, then AI authors.
Ordered by follower count so the strongest profiles lead.
*/
export const getPublicCreators = async (req, res) => {
    try {
        const computeFn = async () => {
            const [humans, aiAuthors] = await Promise.all([
                User.find({ isVerified: true, isPrivate: false })
                    .select("username avatar bio followerCount numberofBlogs")
                    .sort({ followerCount: -1, numberofBlogs: -1 })
                    .limit(CREATOR_LIMIT)
                    .lean(),
                AI_Author.find({ isActive: true })
                    .select("name avatar bio topicDomains followerCount postCount")
                    .sort({ followerCount: -1, postCount: -1 })
                    .limit(CREATOR_LIMIT)
                    .lean(),
            ]);

            const humanCreators = humans.map((u) => ({
                id: u._id,
                identifier: u.username,
                name: u.username,
                avatar: u.avatar || "",
                bio: u.bio || "",
                followerCount: u.followerCount ?? 0,
                postCount: u.numberofBlogs ?? 0,
                authorType: "human",
            }));

            const aiCreators = aiAuthors.map((a) => ({
                id: a._id,
                identifier: a.name,
                name: a.name,
                avatar: a.avatar || "",
                bio: a.bio || "",
                topics: a.topicDomains || [],
                followerCount: a.followerCount ?? 0,
                postCount: a.postCount ?? 0,
                authorType: "AI",
            }));

            return { humans: humanCreators, ai: aiCreators };
        };

        const result = await getOrSetCacheWithLock(
            "public:creators",
            CREATORS_TTL_SECONDS,
            computeFn
        );

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/*
GET /api/public/stories
Public feed of the newest published PUBLIC posts, split into human and AI so the
landing page can showcase both. "followers"/"private" posts are never included.
*/
export const getPublicStories = async (req, res) => {
    try {
        const computeFn = async () => {
            const posts = await Post.find({
                published: true,
                visibility: "public",
            })
                .sort({ createdAt: -1 })
                .limit(STORY_LIMIT * 2)
                .select(
                    "title slug coverImage tags likeCount commentCount createdAt authorType catchline readTime authorId"
                )
                .lean();

            // Batch-resolve authors (avoids an N+1 findById per post).
            const humanIds = posts.filter((p) => p.authorType === "human").map((p) => p.authorId);
            const aiIds = posts.filter((p) => p.authorType === "AI").map((p) => p.authorId);

            const [humanAuthors, aiAuthors] = await Promise.all([
                humanIds.length
                    ? User.find({ _id: { $in: humanIds } }).select("username avatar").lean()
                    : Promise.resolve([]),
                aiIds.length
                    ? AI_Author.find({ _id: { $in: aiIds } }).select("name avatar").lean()
                    : Promise.resolve([]),
            ]);

            const humanMap = new Map(humanAuthors.map((u) => [u._id.toString(), u]));
            const aiMap = new Map(aiAuthors.map((a) => [a._id.toString(), a]));

            const human = [];
            const ai = [];

            for (const post of posts) {
                const isAI = post.authorType === "AI";
                const author = isAI
                    ? aiMap.get(post.authorId?.toString())
                    : humanMap.get(post.authorId?.toString());

                // Skip posts whose author record is missing/deleted.
                if (!author) continue;

                const formatted = {
                    postId: post._id,
                    title: post.title,
                    slug: post.slug,
                    coverImage: post.coverImage || "",
                    tags: post.tags || [],
                    category: post.tags?.[0] || "Story",
                    likeCount: post.likeCount ?? 0,
                    commentCount: post.commentCount ?? 0,
                    createdAt: post.createdAt,
                    authorType: post.authorType,
                    catchline: post.catchline || "",
                    readTime: post.readTime ?? 0,
                    author: {
                        identifier: isAI ? author.name : author.username,
                        name: isAI ? author.name : author.username,
                        avatar: author.avatar || "",
                    },
                };

                if (isAI) {
                    if (ai.length < STORY_LIMIT) ai.push(formatted);
                } else if (human.length < STORY_LIMIT) {
                    human.push(formatted);
                }
            }

            return { human, ai };
        };

        const result = await getOrSetCacheWithLock(
            "public:stories",
            STORIES_TTL_SECONDS,
            computeFn
        );

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
