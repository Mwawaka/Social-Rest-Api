const router = require("express").Router();
const User = require("../models/User");
const argon = require("argon2");

// update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id && req.body.isAdmin) {
    if (req.body.password) {
      // updating the password 
      const pass = req.body.password;
      try {
        const hash = await argon.hash(pass);
        req.body.password = hash;
      } catch (error) {
        return res.status(500).json(error);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account updated successfully");
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json("You can only update your account");
  }
});

// delete user

router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id && req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account deleted successfully");
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json("You can only delete your account");
  }
});

// get user

router.get("/:id", async (req, res) => {
  try {
    if (req.body.userId !== req.params.id) {
      const user = await User.findById(req.params.id);
      const { password, updateAt, ...other } = user._doc;
      res.status(200).json(user);
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});
// follow user

router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(currentUser)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("User has been followed");
      } else {
        res.status(403).json("Already followed the user");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  } else {
    return res.status(403).json("You are not allowed to follow yourself");
  }
});

// unfollow user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("User has been unfollowed");
      } else {
        res.status(403).json("Already unfollowed the user");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  } else {
    return res.status(403).json("You are not allowed to unfollow yourself");
  }
});

module.exports = router;
