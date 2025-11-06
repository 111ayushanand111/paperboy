const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 1000 
  },
  role: {
    type: String,
    default: 'user' // 'user' or 'admin'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);