const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // 1. REMOVE the isCorrect field.
  // isCorrect: { type: Boolean, default: false },

  // 2. ADD a price field. We'll default it to 50 (for 50¢).
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
        "world",
        "politics",
        "business",
        "technology",
        "sports",
        "science",
        "entertainment",
        "health",
        "general",
      ],
      index: true,
    },
    
    // 3. ADD a field to store which option was the final, correct answer.
    // We set this to null initially.
    resolvingOptionName: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);