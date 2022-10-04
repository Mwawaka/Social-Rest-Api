const router = require("express").Router();
const User = require("../models/User");
const argon = require("argon2");

// register
router.post("/register", async (req, res) => {
  try {
    //hashing password
    const pass = req.body.password;
    const hash = await argon.hash(pass);

    // crete new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hash,
    });
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json("Failed to create user");
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    !user && res.status(404).send("Email does not exist");
    const pass = req.body.password;
    const verifiedPass = await argon.verify(user.password, pass);
    !verifiedPass && res.status(404).send("Password does not match");
    res.status(200).send("Logged in");
  } catch (error) {
    res.status(500).json(error);
  }
});
module.exports = router;
