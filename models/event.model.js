const mongoose = require('mongoose');


const roundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  title: { type: String, required: true }, // e.g., "Aptitude Test", "Interview"
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { 
    type: String, 
    enum: ['Upcoming', 'Live', 'Complete'], 
    default: 'Upcoming' 
  }, 
});

// --- MAIN SCHEMA: EVENT ---
const eventSchema = new mongoose.Schema({
  // 1. Basic Info
  title: { type: String, required: true },
  description: { type: String, required: true }, // Full detailed description
  category: { 
    type: String, 
    enum: ['Hackathon', 'Conference', 'Workshop', 'Seminar', 'Cultural'], 
    required: true 
  },
  department: { type: String, default: 'General' },
  location: { type: String, default: 'TBD' },
  
  // 2. Dates & Times
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  // 3. Status
  status: { 
    type: String, 
    enum: ['Draft', 'Pending', 'Approved', 'Rejected', 'Completed'], 
    default: 'Approved' 
  },

  // 4. Media & Assets (Cloudinary / AWS S3 URLs)
  posterUrl: { type: String }, // The main event banner/poster
  sponsorLogos: [{ type: String }], // Array of image URLs for sponsors

  // 5. Seat Limits & Registrations
  maxSeats: { type: Number, default: 0 }, // e.g., 100. (0 means unlimited)
  registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // 6. Organization & Team Management
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  
  // "Assign the events to students available"
  // These are the volunteers/organizers managing the event
  assignedOrganizers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // 7. Event Rounds
  rounds: [roundSchema] ,

  certificateConfig: {
    templateId: { type: String, default: "" }, 
    isEnabled: { type: Boolean, default: false },
    winnerTemplateId: { type: String, default: null }
  },
  // Add this to your eventSchema in models/event.model.js
  issuedCertificates: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      certificateUrl: { type: String },
      type: { type: String, enum: ['Participation', 'Excellence'] }
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);