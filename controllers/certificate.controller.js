const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Event = require('../models/event.model');
const CertificateTemplate = require('../models/certificateTemplate.model');
const IssuedCertificate = require('../models/issuedCertificate.model');

// --- 1. CONFIGURATION (Organizer) ---

// Create a mapping (e.g., Round 1 -> Template ID 123)
exports.createTemplateMapping = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, templateId, assignedForRound, tag } = req.body;

    const newTemplate = await CertificateTemplate.create({
      event: eventId,
      name,
      templateId,
      assignedForRound,
      tag
    });

    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all mappings for an event
exports.getEventTemplates = async (req, res) => {
  try {
    const templates = await CertificateTemplate.find({ event: req.params.eventId });
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// --- 2. ISSUING LOGIC (Organizer Trigger) ---

exports.issueCertificates = async (req, res) => {
  const { eventId } = req.params;
  const API_KEY = process.env.TEMPLATED_API_KEY;

  try {
    const event = await Event.findById(eventId).populate('registeredStudents');
    const templates = await CertificateTemplate.find({ event: eventId });

    if (!templates.length) return res.status(400).json({ message: "No templates configured." });

    let issuedCount = 0;
    const errors = [];

    for (const student of event.registeredStudents) {
      let maxRound = 0;
      if (event.rounds && event.rounds.length > 0) {
        event.rounds.forEach(round => {
           const attended = round.attendance.some(id => id.toString() === student._id.toString());
           if (attended && round.roundNumber > maxRound) maxRound = round.roundNumber;
        });
      }

      if (maxRound === 0) continue;

      const template = templates.find(t => t.assignedForRound == maxRound); 
      if (!template) continue;

      const existing = await IssuedCertificate.findOne({ event: eventId, user: student._id });
      if (existing) continue; 

      // --- STEP 4: ACTUAL GENERATION & SAVING ---
      const verificationCode = uuidv4();
      const verifyUrl = `${process.env.FRONTEND_URL}/verify/${verificationCode}`;
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;

      try {
        const response = await axios.post(
          'https://api.templated.io/v1/render', 
          {
            template: template.templateId, 
            layers: {
              "student_name": { "text": student.name },
              "event_title": { "text": event.title },
              "issue_date": { "text": new Date().toLocaleDateString('en-GB') },
              "qr_image": { "image_url": qrImageUrl }, 
              "certificate_tag": { "text": template.tag } 
            }
          },
          { 
            headers: { 
              'Authorization': `Bearer ${API_KEY}`, 
              'Content-Type': 'application/json' 
            } 
          }
        );

        const pdfUrl = response.data.render_url || response.data.url;

        if (pdfUrl) {
          // THIS IS WHAT MAKES THE DATA APPEAR ON THE FRONTEND
          await IssuedCertificate.create({
            user: student._id,
            event: eventId,
            templateConfig: template._id,
            pdfUrl: pdfUrl,
            verificationCode: verificationCode
          });
          issuedCount++;
        }
      } catch (apiErr) {
        console.error(`API Error for ${student.name}:`, apiErr.response?.data || apiErr.message);
        errors.push(student.name);
      }
    }

    res.status(200).json({ message: `Success! Issued ${issuedCount} new certificates.`, errors });
  } catch (error) {
    console.error("Issuance Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// --- 3. STUDENT ACCESS ---

exports.getMyCertificates = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const studentId = req.user.id; 

    const certificates = await IssuedCertificate.find({ user: studentId })
      .populate('event', 'title startDate') 
      .populate('templateConfig', 'name tag') 
      .sort({ issuedAt: -1 });

    res.status(200).json(certificates);
  } catch (error) {
    console.error("Error in getMyCertificates:", error); 
    res.status(500).json({ message: error.message });
  }
};