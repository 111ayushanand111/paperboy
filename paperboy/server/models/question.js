const mongoose = require("mongoose");

// --- NEW: Sub-schema for storing a price snapshot ---
const priceHistoryEntrySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  // We'll store all option prices at this timestamp
  prices: [{
    _id: false, // Don't store mongoose IDs for this sub-document
    name: String,
    price: Number
  }]
});
// ---

const optionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 50 },
});

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    options: [optionSchema],
    articleUrl: { type: String, required: true },
    category: {
      type: String,
      required: true,
      lowercase: true,
      enum: [
        "world", "politics", "business", "technology",
        "sports", "science", "entertainment", "health", "general",
      ],
      index: true,
    },
    resolvingOptionName: { type: String, default: null },

    // --- ADD THIS LINE: Array to store price history ---
    priceHistory: [priceHistoryEntrySchema]
    // ---
  },
  { timestamps: true }
);

// --- NEW: Add initial price history when a new question is created ---
questionSchema.pre('save', function(next) {
  // Check if this is a new document and price history is empty
  if (this.isNew && this.priceHistory.length === 0) {
    // Add the initial set of prices to the history
    this.priceHistory.push({
      prices: this.options.map(opt => ({ name: opt.name, price: opt.price }))
      // Timestamp will be added by default
    });
  }
  next();
});
// ---

module.exports = mongoose.model("Question", questionSchema);