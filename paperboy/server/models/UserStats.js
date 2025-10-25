const mongoose = require("mongoose");

const userStatsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  attempted: { type: Number, default: 0 },
  correct: { type: Number, default: 0 },
});

module.exports = mongoose.model("UserStats", userStatsSchema);
