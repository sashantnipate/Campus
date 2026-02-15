const mongoose = require('mongoose');

const certificateTemplateSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  }, // e.g., "Round 1 Participation" or "Finalist Excellence"
  
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  
  templateId: { 
    type: String, 
    required: true 
  }, // ID from Templated.io

  // The "Tag" or Category
  tag: {
    type: String,
    // You can allow custom inputs by removing 'enum' if needed, 
    // but this enforces the list you asked for.
    enum: ['Participation', 'Excellence', 'Collaboration', 'Winner', 'Runner Up', 'Special Mention'],
    default: 'Participation'
  },
  
  // Custom text if they select a tag that needs more detail (like "1st Place")
  customTagInput: { type: String },

  // THE MAPPING LOGIC:
  // "If a student's max round reached is X, give them this certificate"
  assignedForRound: { 
    type: Number, 
    required: true 
  } 

}, { timestamps: true });

certificateTemplateSchema.index({ event: 1, assignedForRound: 1 }, { unique: true });

module.exports = mongoose.model('CertificateTemplate', certificateTemplateSchema);