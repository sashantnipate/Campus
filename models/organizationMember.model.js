const mongoose = require('mongoose');

const organizationMemberSchema = mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['Admin', 'Member'], default: 'Member' },
  joinedAt: { type: Date, default: Date.now }
});

organizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('OrganizationMember', organizationMemberSchema);