const Event = require('../models/event.model'); 
const EventProgress = require('../models/eventProgress.model');
const getStudentEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ startDate: 1 });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Unable to fetch events' });
  }
};

const getEventDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const registerForEvent = async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req.body; 

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.registeredStudents.includes(userId)) {
      return res.status(400).json({ message: "Already registered" });
    }

    if (event.maxSeats > 0 && event.registeredStudents.length >= event.maxSeats) {
      return res.status(400).json({ message: "Event is full" });
    }

    event.registeredStudents.push(userId);
    await event.save();

    await EventProgress.create({
      event: eventId,
      student: userId,
      organizationId: event.organizationId || null,
      currentRound: 1,
      roundHistory: [{
        roundNumber: 1,
        status: 'Pending'
      }]
    });

    res.status(200).json({ message: "Successfully registered!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyRegistrations = async (req, res) => {
  try {
    const { userId } = req.params;

    const progressRecords = await EventProgress.find({ student: userId })
      .populate({
        path: 'event',
        select: 'title category department location startDate rounds posterUrl status', // Fetch only needed fields
        populate: { path: 'organizationId', select: 'name' }
      })
      .sort({ updatedAt: -1 }); 

    const registrations = progressRecords.map(record => {
      if (!record.event) return null; 
      
      let displayStatus = record.overallStatus;
      
      if (displayStatus === 'Eliminated') displayStatus = 'Rejected'; 
      if (displayStatus === 'Participating' && record.currentRound > 1) displayStatus = 'Qualified';

      return {
        _id: record._id,       // The ID of the Progress Document
        event: record.event,   // Full populated event details
        status: displayStatus, // "Qualified", "Rejected", "Registered"
        currentRound: record.currentRound,
        score: record.roundHistory[record.roundHistory.length - 1]?.score || 0
      };
    }).filter(item => item !== null);

    res.status(200).json(registrations);

  } catch (error) {
    console.error("My Registrations Error:", error);
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
};

module.exports = { getStudentEvents, getEventDetails, registerForEvent, getMyRegistrations };