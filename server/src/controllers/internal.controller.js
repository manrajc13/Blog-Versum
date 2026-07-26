import { createAIPost } from "../services/post.service.js";

// POST /api/internal/posts
// Consumed by the Python LangGraph publisher, never by the frontend.
// Auth is handled upstream by the internalApiAuth middleware.
export const createInternalPost = async (req, res) => {
    try {
        const { authorName, title, catchline, content, tags } = req.body;

        // Validate the AI-generated content fields the caller must supply.
        if (!authorName || !title || !content || !catchline) {
            return res.status(400).json({
                message:
                    "authorName, title, catchline and content are required",
            });
        }

        const post = await createAIPost({
            authorName,
            title,
            catchline,
            content,
            tags: Array.isArray(tags) ? tags : [],
        });

        return res.status(201).json({
            message: "Post created",
            postId: post._id,
            slug: post.slug,
        });
    } catch (err) {
        // Service throws err.status for expected failures (e.g. unknown author) —
        // those messages are safe to return as-is. Anything else is unexpected,
        // so log it and don't leak internals to the caller.
        const status = err.status || 500;
        if (status === 500) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        return res.status(status).json({ message: err.message });
    }
};
