const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { User } = require("../models/user");
const bcrypt = require("bcrypt");

passport.use(
  new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    async function verifyCallback(username, password, done) {
      console.log(username, password);
      try {
        const user = await User.findOne({ username });
        console.log(user);
        if (!user) {
          return done(null, false, { message: "user not found" });
        }
        console.log(password, user.password);
        if (!(await bcrypt.compare(password, user.password))) {
          return done(null, false, { message: "password mismatch" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
});
