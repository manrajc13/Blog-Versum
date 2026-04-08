import express from 'express';
import protectRoute from '../middleware/auth.middleware.js';
import Post from "../models/post.model.js";
import Follow from "../models/follow.model.js";
import User from "../models/user.model.js";
import AI_Author from '../models/ai.model.js';

const router = express.Router();


router.get('/:query/:isBlog/:userType', protectRoute, async (req, res) => {
  const user  = req.user;
  const { query, isBlog, userType } = req.params;

  const data = {};

  try {
    const following = await Follow.find({
      followerId: user._id,
      status: "accepted"
    }).select("followingId");

    const followingIds = following.map(f => f.followingId);

    const visibilityFilter = {
      $or: [
        { visibility: "public" },
        {
          visibility: "followers",
          authorId: { $in: followingIds }
        }
      ]
    };

    if (isBlog === 'true' || isBlog === 'all') {

      const postQuery = {
        title: { $regex: `^${query}`, $options: "i" },
        published: true,
        ...visibilityFilter
      };

      if (userType === 'AI') postQuery.authorType = "AI";
      else if (userType === 'Human') postQuery.authorType = "human";

      const posts = await Post.find(postQuery)
        .select("_id title authorId readTime coverImage authorType slug")
        .limit(5)
        .lean();

      const humanAuthorIds = posts
        .filter(post => post.authorType === "human")
        .map(post => post.authorId);

      const aiAuthorIds = posts
        .filter(post => post.authorType === "AI")
        .map(post => post.authorId);

      const [humanAuthors, aiAuthors] = await Promise.all([
        humanAuthorIds.length
          ? User.find({ _id: { $in: humanAuthorIds } }).select("_id username").lean()
          : Promise.resolve([]),
        aiAuthorIds.length
          ? AI_Author.find({ _id: { $in: aiAuthorIds } }).select("_id name").lean()
          : Promise.resolve([])
      ]);

      const humanAuthorMap = new Map(humanAuthors.map(author => [author._id.toString(), author.username]));
      const aiAuthorMap = new Map(aiAuthors.map(author => [author._id.toString(), author.name]));

      data.posts = posts.map(post => ({
        ...post,
        username: post.authorType === "AI"
          ? aiAuthorMap.get(post.authorId.toString()) || null
          : humanAuthorMap.get(post.authorId.toString()) || null
      }));
    }

    if (isBlog === 'false' || isBlog === 'all') {
      if (userType === 'AI') {
        const aiUsers = await AI_Author.find({
          name: { $regex: `^${query}`, $options: "i" }
        })
          .select("_id name avatar")
          .limit(5)
          .lean();

        data.users = aiUsers.map(author => ({
          _id: author._id,
          username: author.name,
          avatar: author.avatar,
          authorType: "AI"
        }));
      } else if (userType === 'Human') {
        const users = await User.find({
          username: { $regex: `^${query}`, $options: "i" }
        })
          .select("_id username avatar")
          .limit(5);

        data.users = users;
      } else {
        const [users, aiUsers] = await Promise.all([
          User.find({
            username: { $regex: `^${query}`, $options: "i" }
          })
            .select("_id username avatar")
            .limit(5)
            .lean(),
          AI_Author.find({
            name: { $regex: `^${query}`, $options: "i" }
          })
            .select("_id name avatar")
            .limit(5)
            .lean()
        ]);

        data.users = [
          ...users.map(author => ({
            _id: author._id,
            username: author.username,
            avatar: author.avatar,
            authorType: "human"
          })),
          ...aiUsers.map(author => ({
            _id: author._id,
            username: author.name,
            avatar: author.avatar,
            authorType: "AI"
          }))
        ].slice(0, 5);
      }
    }

    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;