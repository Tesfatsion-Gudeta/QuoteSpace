const express = require("express");
const mongoose = require("mongoose");
const { validate, User } = require("../models/user");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const router = express.Router();
const auth = require("../middleware/auth");
require("dotenv").config();
// const config=require('config')
const jwt = require("jsonwebtoken");
const jwtRefreshKey = process.env.JWTREFRESHKEY;
const passport = require("passport");
require("../config/passport");

//routes

//  Start Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }), // Disable sessions (JWT-based)
  (req, res) => {
    const token = req.user.token; // Extract JWT token from passport callback
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.json({ message: "loggedin" }); // Redirect user to frontend dashboard
  }
);

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

//signin
router.post("/signin", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("user already registered");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken(); // Generate refresh token

  // Set the refresh token as a cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Set to true in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "name", "email"]));
});

//login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).send("email and password required");

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send("Invalid email or password");

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password");

  const accessToken = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  //refreshtoken
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Set to true in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.header("x-auth-token", accessToken).send("user logged in successfully");
});

//route for refreshing the token

router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log("Refresh Token:", refreshToken);
  if (!refreshToken) return res.status(401).send("refresh token required!.");

  try {
    //   const decoded=jwt.verify(refreshToken,config.get('jwtRefreshKey'))
    const decoded = jwt.verify(refreshToken, jwtRefreshKey);
    const user = await User.findById(decoded._id);
    if (!user) return res.status(400).send("Invalid refresh token.");
    const newAccessToken = user.generateAuthToken();
    res
      .header("x-auth-token", newAccessToken)
      .send("Token refreshed successfully.");
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(403).send("Invalid or expired refresh token.");
  }
});

//for loggingout

router.post("/api/logout", (req, res) => {
  res.clearCookie("refreshToken"); // Clear the refresh token cookie
  res.send("Logged out successfully.");
});

//export
module.exports = router;
