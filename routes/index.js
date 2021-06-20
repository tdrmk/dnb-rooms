const { Router } = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { User } = require("../models/user");

const router = Router();

router.get("/", (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
  }
  res.send(`Welcome ${req.user.username}`);
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/",
  })
);

router.post("/register", (req, res) => {
  (async () => {
    try {
      const password = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        username: req.body.username,
        password,
      });
      await user.save();
      res.redirect("/login");
    } catch (err) {
      console.error("register failed:", err);
      res.redirect("/register");
    }
  })();
});

module.exports = router;
