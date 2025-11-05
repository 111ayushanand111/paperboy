const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 50 },
  isCorrect: { type: Boolean, default: false }
});

const priceHistorySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  prices: [{
    name: String,
    price: Number
  }]
});

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  options: [optionSchema],
  articleUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    // --- ADD "trending" TO THIS LIST ---
    enum: ['politics', 'sports', 'tech', 'science', 'trending']
  },
  resolvingOptionName: {
    type: String,
    default: null
  },
  priceHistory: [priceHistorySchema]
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);