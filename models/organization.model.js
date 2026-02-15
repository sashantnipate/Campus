const mongoose = require('mongoose');

const organizationSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  joinCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Organization', organizationSchema);