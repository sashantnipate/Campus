const Organization = require('../models/organization.model');
const OrganizationMember = require('../models/organizationMember.model');
const User = require('../models/user.model'); 
const Event = require('../models/event.model');
const EventProgress = require('../models/eventProgress.model');

const createOrganization = async (req, res) => {
  const { name, description, userId } = req.body; 
  try {
    const codePrefix = name.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const joinCode = `${codePrefix}-${randomNum}`;

    const org = await Organization.create({
      name, description, adminId: userId, joinCode
    });

    await OrganizationMember.create({
      organizationId: org._id, userId: userId, role: 'Admin'
    });

    res.status(201).json({ message: 'Organization Created', org });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const joinOrganization = async (req, res) => {
  const { joinCode, userId } = req.body;
  try {
    const org = await Organization.findOne({ joinCode });
    if (!org) return res.status(404).json({ message: 'Invalid Join Code' });

    const existingMember = await OrganizationMember.findOne({ organizationId: org._id, userId });
    if (existingMember) return res.status(400).json({ message: 'Already a member' });

    await OrganizationMember.create({
      organizationId: org._id, userId: userId, role: 'Member'
    });

    res.status(200).json({ message: `Successfully joined ${org.name}`, org });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserOrganizations = async (req, res) => {
  const { userId } = req.params;
  try {
    const memberships = await OrganizationMember.find({ userId }).populate('organizationId');

    
    const orgs = memberships
      .filter(m => m.organizationId !== null) 
      .map(m => ({
        id: m.organizationId._id,
        name: m.organizationId.name,
        role: m.role,
        code: m.organizationId.joinCode,
        members: 1, 
        events: 0   
      }));

    res.status(200).json(orgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getOrganizationById = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    res.status(200).json(org);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrganizationMembers = async (req, res) => {
  try {
    const members = await OrganizationMember.find({ organizationId: req.params.orgId })
      .populate('userId', 'name email profileImage'); 
    const formatted = members.map(m => ({
      id: m.userId._id,
      name: m.userId.name || 'Unknown',
      email: m.userId.email,
      profileImage: m.userId.profileImage || '',
      role: m.role,
      status: 'Active', 
      joinedAt: m.joinedAt
    }));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- EVENT CONTROLLERS ---

const getOrganizationEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizationId: req.params.orgId }).sort({ startDate: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrganizationEvent = async (req, res) => {
  const { userId, ...eventData } = req.body;
  const { orgId } = req.params;

  try {
    const member = await OrganizationMember.findOne({ organizationId: orgId, userId });
    if (!member) return res.status(403).json({ message: 'You must be a member to post events.' });

    const newEvent = await Event.create({
      ...eventData,
      organizationId: orgId,
      assignedOrganizers: [userId], // FIX: Use assignedOrganizers (Array)
      status: 'Pending' 
    });
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSoloEvent = async (req, res) => {
  try {
    const { userId, ...eventData } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const newEvent = await Event.create({
      ...eventData,           
      organizationId: null,   
      assignedOrganizers: [userId], 
      status: 'Pending'       
    });

    res.status(201).json(newEvent);
  } catch (error) {
    console.error("SOLO CREATE ERROR:", error); 
    res.status(500).json({ message: error.message });
  }
};

const getSoloEvents = async (req, res) => {
  try {
    const events = await Event.find({ 
      assignedOrganizers: { $in: [req.params.userId] },
      organizationId: null 
    }).sort({ startDate: 1 });
    
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId).populate('registeredStudents', 'name email rollNumber department');
    if (!event) return res.status(404).json({ message: "Event not found" });

    // 2. Get the progress data for these students
    const progressRecords = await EventProgress.find({ event: eventId });

    const participants = event.registeredStudents.map(student => {
      const progress = progressRecords.find(p => p.student.toString() === student._id.toString());
      
      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        roll: student.rollNumber,
        department: student.department,
        currentRound: progress ? progress.currentRound : 1,
        roundStatus: progress ? progress.roundHistory.reduce((acc, r) => {
          acc[r.roundNumber] = { attended: r.attended, status: r.status };
          return acc;
        }, {}) : {}
      };
    });

    res.status(200).json(participants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { studentId, roundNumber, status } = req.body; // status: 'Present' or 'Absent'

    // --- 1. UPDATE STUDENT PROGRESS (Your existing logic) ---
    let progress = await EventProgress.findOne({ event: eventId, student: studentId });
    if (!progress) {
      progress = new EventProgress({ event: eventId, student: studentId });
    }

    const roundIndexProgress = progress.roundHistory.findIndex(r => r.roundNumber === parseInt(roundNumber));
    // Map 'Present' to true/false for the boolean field 'attended'
    const isAttended = status === 'Present';

    if (roundIndexProgress > -1) {
      progress.roundHistory[roundIndexProgress].attended = isAttended;
      progress.roundHistory[roundIndexProgress].status = status;
    } else {
      progress.roundHistory.push({
        roundNumber: parseInt(roundNumber),
        attended: isAttended,
        status: status
      });
    }
    await progress.save();

    // --- 2. NEW: UPDATE EVENT MODEL (Critical for Certificates) ---
    const event = await Event.findById(eventId);
    if (event) {
        const roundIndexEvent = event.rounds.findIndex(r => r.roundNumber === parseInt(roundNumber));
        
        if (roundIndexEvent > -1) {
            const round = event.rounds[roundIndexEvent];
            
            if (status === 'Present') {
                // Add student ID if not already there
                if (!round.attendance.includes(studentId)) {
                    round.attendance.push(studentId);
                }
            } else {
                // Remove student ID if status is Absent
                round.attendance = round.attendance.filter(id => id.toString() !== studentId);
            }
            await event.save(); // <--- This fixes the empty array in your screenshot
        }
    }

    res.status(200).json({ message: "Attendance updated in both records" });
  } catch (error) {
    console.error("Mark Attendance Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const qualifyStudent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { studentId, nextRoundNumber } = req.body;

    let progress = await EventProgress.findOne({ event: eventId, student: studentId });

    if (!progress) {
      progress = new EventProgress({ event: eventId, student: studentId });
    }

    progress.currentRound = nextRoundNumber;
    
    const prevRoundIndex = progress.roundHistory.findIndex(r => r.roundNumber === (nextRoundNumber - 1));
    if (prevRoundIndex > -1) {
      progress.roundHistory[prevRoundIndex].status = 'Qualified';
    }

    await progress.save();
    res.status(200).json({ message: "Student qualified" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRoundStatus = async (req, res) => {
  try {
    const { eventId, roundNumber } = req.params;
    const { status } = req.body; // e.g., 'LIVE', 'COMPLETED'

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const roundIndex = event.rounds.findIndex(r => r.roundNumber === parseInt(roundNumber));

    if (roundIndex > -1) {
      event.rounds[roundIndex].status = status;
      await event.save();
      res.status(200).json({ message: `Round ${roundNumber} set to ${status}` });
    } else {
      res.status(404).json({ message: "Round number not found in event" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createOrganization, joinOrganization, getUserOrganizations,
  getOrganizationById, getOrganizationMembers, 
  getOrganizationEvents, createOrganizationEvent,
  createSoloEvent, getSoloEvents, getEventParticipants, markAttendance, qualifyStudent, updateRoundStatus
};