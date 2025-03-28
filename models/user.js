const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
// const config = require("config");

require("dotenv").config();
const jwtPrivateKey = process.env.JWTPRIVATEKEY;
const jwtRefreshKey = process.env.JWTREFRESHKEY;

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    minLength: 3,
    maxLength: 50,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minLength: 5,
    maxLength: 255,
  },
  password: {
    type: String,

    minLength: 6,
    maxLength: 1024,
    required: function () {
      return !this.googleId;
    },
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

//generating jsonwebtoken for signedup users
userSchema.methods.generateAuthToken = function () {
  //   const token = jwt.sign({ _id: this._id }, config.get("jwtPrivateKey"));
  const token = jwt.sign({ _id: this._id }, jwtPrivateKey);
  return token;
};

userSchema.methods.generateRefreshToken = function () {
  //   const token = jwt.sign({ _id: this._id }, config.get("jwtRefreshKey")
  const token = jwt.sign({ _id: this._id }, jwtRefreshKey, {
    expiresIn: "7d",
  });
  return token;
};

const User = mongoose.model("User", userSchema);

//input validation
function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(6).max(255).required(),
    isAdmin: Joi.boolean(),
  });
  return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
