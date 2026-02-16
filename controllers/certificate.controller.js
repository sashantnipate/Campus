const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Event = require('../models/event.model');
const CertificateTemplate = require('../models/certificateTemplate.model');
const IssuedCertificate = require('../models/issuedCertificate.model');

// --- 1. CONFIGURATION (Organizer) ---

exports.createTemplateMapping = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, templateId, assignedForRound, tag } = req.body;

    const newTemplate = await CertificateTemplate.create({
      event: eventId, name, templateId, assignedForRound, tag
    });

    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEventTemplates = async (req, res) => {
  try {
    const templates = await CertificateTemplate.find({ event: req.params.eventId });
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTemplateMapping = async (req, res) => {
  try {
    await CertificateTemplate.findByIdAndDelete(req.params.templateId);
    res.status(200).json({ message: "Template deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

exports.previewTemplate = async (req, res) => {
    const { templateId } = req.body;
    const API_KEY = process.env.TEMPLATED_API_KEY;

    // Dummy data for preview
    const dummyData = {
        "student_name": "John Doe",
        "event_title": "Preview Event 2024",
        "issue_date": new Date().toLocaleDateString('en-GB'),
        "certificate_tag": "Preview",
        "qr_image": "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Preview"
    };

    try {
        const response = await axios.post(
            'https://api.templated.io/v1/render',
            { template: templateId, layers: dummyData },
            { headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' } }
        );
        res.status(200).json({ url: response.data.render_url || response.data.url });
    } catch (error) {
        console.error("Preview Error:", error.response?.data);
        res.status(500).json({ message: "Preview generation failed. Check Template ID." });
    }
};


// --- 2. ISSUING LOGIC (With UPGRADE Fix) ---

exports.issueCertificates = async (req, res) => {
  const { eventId } = req.params;
  const API_KEY = process.env.TEMPLATED_API_KEY;

  try {
    const event = await Event.findById(eventId).populate('registeredStudents');
    const templates = await CertificateTemplate.find({ event: eventId });

    if (!templates.length) return res.status(400).json({ message: "No templates configured." });

    let issuedCount = 0;
    let upgradedCount = 0;
    const errors = [];

    for (const student of event.registeredStudents) {
      // 1. Determine Max Round
      let maxRound = 0;
      if (event.rounds && event.rounds.length > 0) {
        event.rounds.forEach(round => {
           const attended = round.attendance.some(id => id.toString() === student._id.toString());
           if (attended && round.roundNumber > maxRound) maxRound = round.roundNumber;
        });
      }

      if (maxRound === 0) continue; 

      // 2. Find Matching Template
      const template = templates.find(t => t.assignedForRound == maxRound); 
      if (!template) continue; 

      // 3. CHECK EXISTING & UPGRADE LOGIC (THE FIX IS HERE)
      const existingCert = await IssuedCertificate.findOne({ event: eventId, user: student._id })
        .populate('templateConfig'); 

      if (existingCert) {
        // If they already have THIS exact certificate, skip
        if (existingCert.templateConfig._id.toString() === template._id.toString()) {
            continue;
        }

        // If existing is from a LOWER round, we delete it (Upgrade)
        if (existingCert.templateConfig.assignedForRound < maxRound) {
            await IssuedCertificate.findByIdAndDelete(existingCert._id);
            upgradedCount++;
        } else {
            // Existing is higher or equal, so we skip
            continue; 
        }
      }

      // 4. Generate New Certificate
      const verificationCode = uuidv4();
      // Corrected URL for HashRouter
      const verifyUrl = `${process.env.FRONTEND_URL}/#/verify/${verificationCode}`;
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
          { headers: { 'Authorization': `Bearer ${API_KEY}` } }
        );

        const pdfUrl = response.data.render_url || response.data.url;

        if (pdfUrl) {
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
        console.error(`Gen Error ${student.name}`);
        errors.push(student.name);
      }
    }

    res.status(200).json({ 
        message: `Processed! Issued ${issuedCount} new certificates. Upgraded ${upgradedCount} students.`, 
        errors 
    });
  } catch (error) {
    console.error("Issuance Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- 3. STUDENT & PUBLIC ACCESS ---

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

exports.verifyCertificate = async (req, res) => {
  try {
    const { code } = req.params;
    const cert = await IssuedCertificate.findOne({ verificationCode: code })
      .populate('user', 'name email studentProfile') 
      .populate('event', 'title startDate location department')
      .populate('templateConfig', 'tag name');

    if (!cert) return res.status(404).json({ success: false, message: "Invalid verification code." });
    
    res.status(200).json({ success: true, data: cert });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, message: "Server error during verification." });
  }
};