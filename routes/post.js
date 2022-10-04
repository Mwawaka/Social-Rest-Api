const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

// create post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json("Post has been created ");
  } catch (error) {
    res.status(500).json(error);
  }
});
// like post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      return res.status(200).json("You have liked the post ");
    } else {
      return res.status(403).json("You have already liked the post");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});
// update post
router.put("/:id/update", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      return res.status(200).json("Successfully updated the Post");
    } else {
      return res.status(403).json("You can only update your post");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});
//  get a post

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      return res.status(200).json(post);
    } else {
      return res.status(404).json("User  not found");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});
// get timeline post
router.get("/timeline/all", async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.json(userPosts.concat(...friendPosts));
  } catch (error) {
    res.status(500).json(error);
  }
});
// delete post
router.delete("/:id/delete", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne({ $set: req.body });
      return res.status(200).json("Successfully deleted the Post");
    } else {
      return res.status(403).json("You can only delete your post");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// unlike post
router.put("/:id/unlike", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.likes.includes(req.body.userId)) {
      await post.updateOne({ $pull: { likes: req.body.userId } });
    } else {
      return res.status(403).json("You have already unliked the post");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
