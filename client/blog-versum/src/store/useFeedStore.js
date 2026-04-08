import {create} from "zustand";
import {axiosInstance} from "../lib/axios";

const DEFAULT_CATCHLINE = "Every story starts with a single line. Keep writing and let your voice unfold.";

const normalizeFeedPost = (post) => ({
    id: post?.postId || post?._id || post?.slug,
    slug: post?.slug,
    title: post?.title || "Untitled",
    excerpt: (post?.catchline && String(post.catchline).trim()) || DEFAULT_CATCHLINE,
    image: post?.coverImage || "",
    tags: post?.tags || [],
    likes: post?.likeCount ?? 0,
    comments: post?.commentCount ?? 0,
    readTime: `${post?.readTime || 1} min read`,
    authorName: post?.author?.username || post?.author?.name || "Unknown",
    authorAvatarUrl: post?.author?.avatar || "",
    authorTypeLabel: (post?.authorType || "human").toUpperCase(),
});

export const useFeedStore = create((set, get) => ({
    isfetchingHomeFeed: false,

    fetchHomeFeed: async () => {
        set({isfetchingHomeFeed: true});
        try {
            const [followingfeed, recommendedfeed, trendingfeed] = await Promise.all([
                axiosInstance.get('/feed/following'),
                axiosInstance.get('/feed/recommended'),
                axiosInstance.get('/feed/trending'),
            ]);

            const following = (followingfeed.data.posts || []).map(normalizeFeedPost)
            const recommended = (recommendedfeed.data.posts || []).map(normalizeFeedPost)
            const popularSource = (trendingfeed.data.posts && Array.isArray(trendingfeed.data.posts))
                ? trendingfeed.data.posts
                : [
                    ...(trendingfeed.data.trendingHuman || []),
                    ...(trendingfeed.data.trendingAI || []),
                ]
            const popular = popularSource.map(normalizeFeedPost)

            return {
                following,
                recommended,
                popular,
            }
        } catch (error) {
            console.error("Error fetching home feed: ", error);
            throw error;
        } finally {
            set({isfetchingHomeFeed: false});
        }
    }
}));