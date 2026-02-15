const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  
  role: { 
    type: String, 
    enum: ['Student', 'Admin'], 
    default: 'Student' 
  },

  studentProfile: {
    rollNumber: { type: String, trim: true },
    department: { type: String, trim: true },
    course: { type: String, trim: true }, // e.g., B.Tech, BCA
    yearOfStudy: { type: String, enum: ['1', '2', '3', '4'] },
  },

  adminProfile: {
    position: String, 
    department: String
  },

  profileImage: { type: String, default: '' },

  isVerified: { type: Boolean, default: true } 

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
