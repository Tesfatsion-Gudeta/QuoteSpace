require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = "http://localhost:5000/api/users/auth/google/callback";
const { User } = require("../models/user");
const jwtPrivateKey = process.env.JWTPRIVATEKEY;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });
          if (!user) {
            user = new User({
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
            });
            await user.save();
          }
        }

        // Generate JWT
        const token = jwt.sign(
          { _id: user._id, isAdmin: user.isAdmin },
          jwtPrivateKey,
          { expiresIn: "15m" }
        );

        return done(null, { token });
      } catch (error) {
        return done(error, false);
      }
    }
  )
);
