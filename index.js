const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
const writings = require("./routes/writings.js");
const qoutes = require("./routes/qoutes.js");
const users = require("./routes/users.js");

app.use(express.json());
app.use(cookieParser());
app.use("/api/writings", writings);
app.use("/api/qoutes", qoutes);
app.use("/api/users", users);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("mongodb connected succesfully.");
  })
  .catch((err) => {
    console.error("mongodb connection error: ", err);
  });

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
