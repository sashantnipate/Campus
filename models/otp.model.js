const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  
  isVerified:{
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900
  },
});

module.exports = mongoose.model('Otp', otpSchema);
