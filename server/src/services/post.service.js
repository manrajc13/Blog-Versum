import Post from "../models/post.model.js";
import AI_Author from "../models/ai.model.js";
import { generateSlug } from "../lib/utils/slugify.js";

// Curated pool of public cover images. The internal (AI) publishing path does
// not receive an image from the caller — it randomly assigns one from here so
// every AI post still gets a cover.
const COVER_IMAGES = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAgdl637JFCoBXP_kWH_MTBkXL2VApbfMRUL9DVpHR8jlA4Y6Nt7FzIB6JLVIaSknItI9vYVG4LIURVLfkqVM6LaE0VRB7i6uaFryXEq7LgidtXlFAB1YiPRX1tkon7FoAcJS4QtiAyXRqKcSSfkpfNE-1IrE-k37tjjBbgyS8D4vNtjMcMwvWHkxJjR5vwlZpwIhGbbsJnSL-yH3UoclGJpnopna5XwSL8HoL-bY7butzNyZ0UEEgQM-2aDDq75daHWGIxYRQ3BA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBl9gYfmoxN70h4IKA_MtIEYelT-6Fu1coFi674AZSWnuuls0mVBhmyenE5HkfXQsHvVhscOT8O0CY1tlp-Ab8576BlIzHEL0B2r5mcr2C30c4Idg57DlQFpBZMKH2qTBuc3INJeTcbwkX3D4ZAsiYRIT6bbsOqY1mDhfD7OKQegOoMmBYWpOXqq-mhdFo_LcHsV1bhmCS65VSjwtvdqwf_zvDte753LMAaiw29j6WMolFmKx9MrIkpRkqBQoWSOExrLgM6Twt8Cw",
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80",
    "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=1200&q=80",
    "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=1200&q=80",
    "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=1200&q=80",
    "https://images.unsplash.com/photo-1530973428-5bf2db2e4d71?w=1200&q=80",
    "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=1200&q=80",
    "https://res.cloudinary.com/ddp559tys/image/upload/v1784021292/microsoft-copilot-ghVMdPN33vM-unsplash_hgopvf.jpg",
    "https://res.cloudinary.com/ddp559tys/image/upload/v1784021361/milad-fakurian--CIj7Jnm4TA-unsplash_pvrinu.jpg",
];

const pickRandomCoverImage = () =>
    COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)];

// Generates a slug that is unique across the posts collection.
const generateUniqueSlug = async (title) => {
    const baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (await Post.exists({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
};

// Rough read-time estimate at ~200 words/min. Content may arrive as a Markdown
// string (AI path) or as a rich-text object, so we normalise to text first.
const calculateReadTime = (content) => {
    const text =
        typeof content === "string" ? content : JSON.stringify(content ?? "");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
};

/**
 * Create a post authored by one of the AI authors.
 *
 * The caller (internal API) only supplies content fields. Everything else —
 * resolving the AI author, slug, read time, cover image, timestamps and
 * persistence — is owned here so both the internal and (later) public paths
 * can share this logic.
 */
export const createAIPost = async ({
    authorName,
    title,
    catchline,
    content,
    tags = [],
}) => {
    // Resolve the AI author by name (case-insensitive exact match).
    const aiAuthor = await AI_Author.findOne({
        name: new RegExp(`^${authorName}$`, "i"),
    });

    if (!aiAuthor) {
        const err = new Error(`Unknown AI author: "${authorName}"`);
        err.status = 404;
        throw err;
    }

    const slug = await generateUniqueSlug(title);

    const post = new Post({
        title,
        slug,
        content,
        catchline,
        coverImage: pickRandomCoverImage(),
        tags,
        readTime: calculateReadTime(content),
        visibility: "public",
        published: true,
        authorId: aiAuthor._id,
        authorType: "AI",
    });

    await post.save();

    // Keep the denormalised post count on the AI author in sync.
    await AI_Author.findByIdAndUpdate(aiAuthor._id, { $inc: { postCount: 1 } });

    return post;
};
