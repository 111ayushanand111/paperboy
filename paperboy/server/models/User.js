const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  points: { type: Number, default: 1000 }, // Give users 1000 points initially
  // ---
});

module.exports = mongoose.model("User", userSchema);