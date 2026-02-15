const mongoose = require('mongoose');

const issuedCertificateSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },

  // Which template was used to generate this?
  templateConfig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CertificateTemplate'
  },

  pdfUrl: { 
    type: String, 
    required: true 
  },

  // Unique code for the QR scanner
  verificationCode: { 
    type: String, 
    required: true, 
    unique: true 
  },

  issuedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model('IssuedCertificate', issuedCertificateSchema);