const Event = require('../models/event.model'); 
const axios = require('axios');
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ startDate: 1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("List Events Error:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

exports.createEvent = async (req, res) => {
  try {
    let eventData = { ...req.body };

    // 1. FIX: Parse 'rounds' string back to JSON
    // FormData sends arrays as strings like "[{...}]", so we must parse it.
    if (eventData.rounds && typeof eventData.rounds === 'string') {
      eventData.rounds = JSON.parse(eventData.rounds);
    }

    // 2. Handle Poster File
    if (req.files && req.files['poster']) {
      eventData.posterUrl = req.files['poster'][0].path;
    }

    // 3. Create
    const newEvent = await Event.create(eventData);
    res.status(201).json(newEvent);

  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// --- UPDATE EVENT ---
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // 1. FIX: Parse 'rounds' string back to JSON
    if (updateData.rounds && typeof updateData.rounds === 'string') {
      updateData.rounds = JSON.parse(updateData.rounds);
    }

    // 2. Handle Poster File (New Upload)
    if (req.files && req.files['poster']) {
      updateData.posterUrl = req.files['poster'][0].path;
    } 
    // 3. Handle Existing Poster URL (No New Upload)
    else if (req.body.posterUrl) {
      updateData.posterUrl = req.body.posterUrl;
    }

    // 4. Update
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(updatedEvent);

  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.saveCertificateConfig = async (req, res) => {
  const { eventId } = req.params;
  const { templateId } = req.body; // The ID user pasted

  try {
    if (!templateId) {
      return res.status(400).json({ message: "Template ID is required" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { 
        $set: { 
          "certificateConfig.templateId": templateId,
          "certificateConfig.isEnabled": true
        } 
      },
      { new: true } // Return the updated document
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ 
      message: "Certificate configured successfully", 
      config: updatedEvent.certificateConfig 
    });

  } catch (error) {
    console.error("Save Cert Config Error:", error);
    res.status(500).json({ message: "Server error updating configuration" });
  }
};

exports.getStudentCertificate = async (req, res) => {
  const { eventId } = req.params;
  const studentId = req.user.id; // Assuming you have auth middleware

  try {
    const event = await Event.findById(eventId).populate('registeredStudents');
    
    // 1. Check if student is registered
    const isRegistered = event.registeredStudents.some(s => s._id.toString() === studentId);
    if (!isRegistered) return res.status(403).json({ message: "Not registered for this event" });

    // 2. Check if certificates are enabled
    if (!event.certificateConfig.isEnabled) {
      return res.status(400).json({ message: "Certificates not yet issued for this event" });
    }

    // 3. Check if already generated
    const existing = event.issuedCertificates?.find(c => c.studentId.toString() === studentId);
    if (existing) return res.status(200).json({ url: existing.certificateUrl });

    // 4. Generate if not exists
    const student = event.registeredStudents.find(s => s._id.toString() === studentId);
    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${eventId}/${studentId}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;

    const response = await axios.post('https://rest.apitemplate.io/v1/create-pdf', {
      template_id: event.certificateConfig.templateId,
      data: {
        student_name: student.name,
        event_title: event.title,
        issue_date: new Date().toLocaleDateString(),
        qr_image: qrImageUrl
      }
    }, { headers: { 'X-API-KEY': process.env.APITEMPLATE_KEY } });

    const pdfUrl = response.data.download_url;

    // 5. Save to event record
    await Event.findByIdAndUpdate(eventId, {
      $push: { issuedCertificates: { studentId, certificateUrl: pdfUrl, type: 'Participation' } }
    });

    res.status(200).json({ url: pdfUrl });
  } catch (error) {
    res.status(500).json({ message: "Generation failed" });
  }
};