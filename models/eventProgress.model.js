const mongoose = require('mongoose');

const eventProgressSchema = new mongoose.Schema({
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  organizationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization',
    default: null // null for solo events
  },
  
  // Current status of the student in the event
  // 'Registered' -> 'Participating' -> 'Qualified' -> 'Winner' or 'Eliminated'
  overallStatus: {
    type: String,
    enum: ['Registered', 'Participating', 'Eliminated', 'Winner'],
    default: 'Registered'
  },

  // Which round the student is currently in (Default 1)
  currentRound: { 
    type: Number, 
    default: 1 
  },

  // Detailed history for each round
  roundHistory: [{
    roundNumber: Number,
    status: { 
      type: String, 
      enum: ['Pending', 'Present', 'Absent', 'Qualified', 'Winner', 'Eliminated'],
      default: 'Pending' 
    },
    score: { type: Number, default: 0 },
    remarks: String,
    updatedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

eventProgressSchema.index({ event: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('EventProgress', eventProgressSchema);