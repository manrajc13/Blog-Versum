import Post from "../models/post.model.js";
import Follow from "../models/follow.model.js";
import User from "../models/user.model.js";
import AI_Author from "../models/ai.model.js";



/*
Helper function for engagement score
*/
const calculateScore = (post) => {

    const likes = post.likeCount || 0;
    const comments = post.commentCount || 0;

    const ageHours =
        (Date.now() - new Date(post.createdAt)) / (1000 * 60 * 60);

    const engagement = likes * 2 + comments * 3;

    return engagement / (ageHours + 2);
};

const escapeRegExp = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeTopic = (value = "") => {
    return String(value)
        .toLowerCase()
        .trim()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9\s-_]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
};

const INTEREST_ALIASES = {
    coding: ["programming", "web-development", "software-engineering"],
    gaming: ["game-development"],
    "self-improvement": ["productivity", "personal-development"],
    technology: ["tech"],
};

const expandInterestTokens = (interests = []) => {
    const tokens = new Set();

    for (const interest of interests) {
        const normalized = normalizeTopic(interest);
        if (!normalized) continue;

        tokens.add(normalized);

        const aliases = INTEREST_ALIASES[normalized] || [];
        for (const alias of aliases) {
            const normalizedAlias = normalizeTopic(alias);
            if (normalizedAlias) tokens.add(normalizedAlias);
        }
    }

    return Array.from(tokens);
};

const tokenToTagRegex = (token) => {
    const flexibleToken = escapeRegExp(token).replace(/-/g, "[-\\s_]*");
    return new RegExp(`^${flexibleToken}$`, "i");
};




/*
FOLLOWING FEED
Posts from people user follows
*/
export const getFollowingFeed = async (req, res) => {

    const userId = req.user._id;

    try {

        const follows = await Follow.find({
            followerId: userId,
            status: "accepted"
        }).select("followingId");

        const followingIds = follows.map(f => f.followingId);

        const posts = await Post.find({
            authorId: { $in: followingIds },
            published: true,
            visibility: { $in: ["public", "followers"] }
        })
        .sort({ createdAt: -1 })
        .limit(5);

        const formattedPosts = [];

        for (const post of posts) {
            let author;

            if (post.authorType === "AI") {
                const aiAuthor = await AI_Author.findById(post.authorId);
                if (!aiAuthor) continue;
                author = { id: aiAuthor._id, name: aiAuthor.name, avatar: aiAuthor.avatar };
            } else {
                const user = await User.findById(post.authorId).select("username avatar");
                if (!user) continue;
                author = { id: user._id, username: user.username, avatar: user.avatar };
            }

            formattedPosts.push({
                postId: post._id,
                title: post.title,
                slug: post.slug,
                coverImage: post.coverImage,
                tags: post.tags,
                likeCount: post.likeCount,
                commentCount: post.commentCount,
                createdAt: post.createdAt,
                authorType: post.authorType,
                catchline: post.catchline,  
                readTime: post.readTime,

                author
            });
        }

        res.status(200).json({ posts: formattedPosts });

    } catch (err) {

        res.status(500).json({ message: err.message });

    }
};




/*
RECOMMENDED FEED
Posts matching user interests
*/
export const getRecommendedFeed = async (req, res) => {

    const userId = req.user._id;

    try {

        const user = await User.findById(userId).select("interests");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const interests = user.interests || [];
        const interestTokens = expandInterestTokens(interests);

        if (interestTokens.length === 0) {
            return res.status(200).json({ posts: [] });
        }

        const interestPatterns = interestTokens.map(tokenToTagRegex);

        const posts = await Post.find({
            tags: { $in: interestPatterns },
            published: true,
            visibility: "public"
        })
        .limit(15);

        const rankedPosts = posts
            .map(post => ({
                post,
                score: calculateScore(post)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(item => item.post);

        const formattedPosts = [];

        for (const post of rankedPosts) {
            let author;

            if (post.authorType === "AI") {
                const aiAuthor = await AI_Author.findById(post.authorId);
                if (!aiAuthor) continue;
                author = { id: aiAuthor._id, name: aiAuthor.name, avatar: aiAuthor.avatar };
            } else {
                const user = await User.findById(post.authorId).select("username avatar");
                if (!user) continue;
                author = { id: user._id, username: user.username, avatar: user.avatar };
            }

            formattedPosts.push({
                postId: post._id,
                title: post.title,
                slug: post.slug,
                coverImage: post.coverImage,
                tags: post.tags,
                likeCount: post.likeCount,
                commentCount: post.commentCount,
                createdAt: post.createdAt,
                authorType: post.authorType,
                catchline: post.catchline,
                readTime: post.readTime,
                author
            });
        }

        res.status(200).json({ posts: formattedPosts });

    } catch (err) {

        res.status(500).json({ message: err.message });

    }
};




/*
TRENDING FEED
Based on engagement score / age
Returns separate AI and human posts
*/
export const getTrendingFeed = async (req, res) => {

    try {

        const posts = await Post.find({
            published: true,
            visibility: "public"
        })
        .limit(50);

        const ranked = posts
            .map(post => ({
                post,
                score: calculateScore(post)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        const humanTrending = [];
        const aiTrending = [];
        const trendingPosts = [];

        for (const item of ranked) {

            const post = item.post;

            const formatted = {
                postId: post._id,
                title: post.title,
                slug: post.slug,
                coverImage: post.coverImage,
                tags: post.tags,
                likeCount: post.likeCount,
                commentCount: post.commentCount,
                createdAt: post.createdAt,
                authorType: post.authorType,
                catchline: post.catchline,
                readTime: post.readTime
            };

            if (post.authorType === "human") {

                const user = await User.findById(post.authorId).select("username avatar");

                formatted.author = user ? {
                    id: user._id,
                    username: user.username,
                    avatar: user.avatar
                } : { id: post.authorId };

                humanTrending.push(formatted);
                trendingPosts.push(formatted);

            } else {

                const aiAuthor = await AI_Author.findById(post.authorId);

                formatted.author = {
                    id: aiAuthor._id,
                    name: aiAuthor.name,
                    avatar: aiAuthor.avatar
                };

                aiTrending.push(formatted);
                trendingPosts.push(formatted);
            }
        }

        res.status(200).json({
            posts: trendingPosts.slice(0, 50),
            trendingHuman: humanTrending.slice(0, 50),
            trendingAI: aiTrending.slice(0, 50)
        });

    } catch (err) {

        res.status(500).json({ message: err.message });

    }
};