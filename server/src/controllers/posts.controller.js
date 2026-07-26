import Post from "../models/post.model.js";
import Follow from "../models/follow.model.js";
import User from "../models/user.model.js";
import { generateSlug } from "../lib/utils/slugify.js";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";
import { assertImageOk, isHostedImageUrl } from "../lib/utils/imageUpload.js";

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




export const createPost = async (req, res) => {

    const authorId = req.user._id;

    try {

        const {
            title,
            content,
            catchline,
            coverImage,
            tags = [],
            visibility = "public",
            published = false,
            readTime,
            fontId
        } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: "Title and content are required"
            });
        }

        const slug = await generateUniqueSlug(title);
        let ImgUrl = "";

        if (coverImage !== undefined && coverImage !== ""){
            if (isHostedImageUrl(coverImage)) {
                ImgUrl = coverImage;
            } else {
                assertImageOk(coverImage);
                const uploadResponse = await cloudinary.uploader.upload(coverImage);
                ImgUrl = uploadResponse.secure_url
            }
        }

        const post = new Post({
            title,
            slug,
            content,
            catchline,
            coverImage: ImgUrl,
            tags,
            readTime,
            visibility,
            published,
            authorId,
            authorType: "human",
            fontId
        });

        await post.save();

        await User.findByIdAndUpdate(authorId, { $inc: { numberofBlogs: 1 } });

        res.status(201).json(post);

    } catch (err) {
        const status = err.status || 500;
        if (status === 500) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        return res.status(status).json({ message: err.message });
    }
};




export const updatePost = async (req, res) => {

    const { postId } = req.params;
    const userId = req.user._id;

    try {

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.authorId.toString() !== userId.toString()) {
            return res.status(403).json({
                message: "Unauthorized"
            });
        }

        const {
            title,
            content,
            coverImage,
            tags,
            visibility,
            published
        } = req.body;


        const updates = {};


        if (title !== undefined) {

            updates.title = title;

            const newSlugBase = generateSlug(title);

            let slug = newSlugBase;
            let counter = 1;

            while (
                await Post.exists({
                    slug,
                    _id: { $ne: postId }
                })
            ) {
                slug = `${newSlugBase}-${counter}`;
                counter++;
            }

            updates.slug = slug;
        }


        if (content !== undefined) updates.content = content;
        if (coverImage !== undefined && coverImage !== "") {
            if (isHostedImageUrl(coverImage)) {
                updates.coverImage = coverImage;
            } else {
                assertImageOk(coverImage);
                const uploadResponse = await cloudinary.uploader.upload(coverImage);
                updates.coverImage = uploadResponse.secure_url;
            }
        }
        if (tags !== undefined) updates.tags = tags;
        if (visibility !== undefined) updates.visibility = visibility;
        if (published !== undefined) updates.published = published;


        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $set: updates },
            { new: true }
        );

        res.status(200).json(updatedPost);

    } catch (err) {
        const status = err.status || 500;
        if (status === 500) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        return res.status(status).json({ message: err.message });
    }
};




export const deletePost = async (req, res) => {

    const { postId } = req.params;
    const userId = req.user._id;

    try {

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.authorId.toString() !== userId.toString()) {
            return res.status(403).json({
                message: "Unauthorized"
            });
        }

        await Post.findByIdAndDelete(postId);

        // Keep denormalized blog count in sync on delete.
        await User.findOneAndUpdate(
            { _id: userId, numberofBlogs: { $gt: 0 } },
            { $inc: { numberofBlogs: -1 } }
        );

        res.status(200).json({
            message: "Post deleted successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};




export const getPosts = async (req, res) => {

    const userId = req.user._id;

    try {

        const posts = await Post.find({ authorId: userId })
        .select("title catchline readTime tags fontId coverImage visibility likeCount commentCount published createdAt slug")
        .sort({ createdAt: -1 })
        .lean();

        res.status(200).json(posts);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};




export const getPostsByUserId = async (req, res) => {

    const viewerId = req.user._id;
    const { userId } = req.params;

    try {

        const follow = await Follow.findOne({
            followerId: viewerId,
            followingId: userId,
            status: "accepted"
        });

        let visibilityAllowed = ["public"];

        if (follow) {
            visibilityAllowed.push("followers");
        }

        const posts = await Post.find({
            authorId: userId,
            published: true,
            visibility: { $in: visibilityAllowed }
        }).sort({ createdAt: -1 });

        res.status(200).json(posts);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};




export const getPostById = async (req, res) => {

    const viewerId = req.user._id;
    const { postId } = req.params;

    try {
        const post = await Post.findOne({
        $or: [
            { _id: mongoose.isValidObjectId(postId) ? postId : null },
            { slug: postId }
        ]
        }).select("content authorId published visibility title slug tags fontId readTime likeCount commentCount coverImage catchline createdAt")
        .lean();

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }


        if (!post.published) {

            if (post.authorId.toString() !== viewerId.toString()) {
                return res.status(403).json({
                    message: "This post is a draft"
                });
            }
        }


        if (post.visibility === "private") {

            if (post.authorId.toString() !== viewerId.toString()) {
                return res.status(403).json({
                    message: "This post is private"
                });
            }
        }


        if (post.visibility === "followers") {

            const follow = await Follow.findOne({
                followerId: viewerId,
                followingId: post.authorId,
                status: "accepted"
            });

            if (!follow && post.authorId.toString() !== viewerId.toString()) {
                return res.status(403).json({
                    message: "Only followers can view this post"
                });
            }
        }

        const isOwner = post.authorId.toString() === viewerId.toString();

        let author = {
            _id: post.authorId,
            username: req.user?.username,
            avatar: req.user?.avatar || ""
        };

        if (!isOwner) {
            const dbAuthor = await User.findById(post.authorId)
                .select("username avatar")
                .lean();

            author = {
                _id: post.authorId,
                username: dbAuthor?.username || null,
                avatar: dbAuthor?.avatar || ""
            };
        }

        res.status(200).json({
            _id: post._id,
            title: post.title,
            slug: post.slug,
            content: post.content,
            catchline: post.catchline,
            coverImage: post.coverImage,
            tags: post.tags,
            fontId: post.fontId,
            readTime: post.readTime,
            likeCount: post.likeCount,
            commentCount: post.commentCount,
            visibility: post.visibility,
            createdAt: post.createdAt,
            author
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};