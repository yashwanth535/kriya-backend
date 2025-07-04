const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  pass: { 
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  maxUrls: {
    type: Number,
    default: 10
  }
});

// Create the User model
const User = mongoose.model('User', userSchema, 'users');

// Export the User model
module.exports = User; 