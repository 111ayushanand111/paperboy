const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Link to the User model
    required: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question", // Link to the Question model
    required: true,
  },
  // The specific option the user bet on (e.g., "Yes", "No", "Candidate A")
  selectedOptionName: {
    type: String,
    required: true,
  },
  // The amount (e.g., points) the user wagered
  betAmount: {
    type: Number,
    required: true,
    min: 1, // Minimum bet amount
  },
  // The price (0-100) of the selected option *at the time the bet was placed*
  priceAtBet: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  // Timestamp when the bet was placed
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Optional: Add indexes for faster querying if needed later
betSchema.index({ userId: 1 });
betSchema.index({ questionId: 1 });

module.exports = mongoose.model("Bet", betSchema);