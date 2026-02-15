const express = require('express');
const router = express.Router();
const { 
  createOrganization, 
  joinOrganization, 
  getUserOrganizations,
  getOrganizationById, 
  getOrganizationMembers, 
  getOrganizationEvents,
  createOrganizationEvent,
  createSoloEvent, 
  getSoloEvents,
  getEventParticipants,
  markAttendance,
  qualifyStudent,
  updateRoundStatus,
} = require('../controllers/organization.controller'); 

// --- 1. SPECIFIC ROUTES (Must be first) ---
router.post('/create', createOrganization);
router.post('/join', joinOrganization);
router.get('/my-orgs/:userId', getUserOrganizations);

// SOLO EVENTS (Must come BEFORE /:orgId routes to avoid collision)
router.post('/events/solo/create', createSoloEvent);
router.get('/events/solo/:userId', getSoloEvents);

// --- 2. DYNAMIC ROUTES (/:orgId) ---
router.get('/:orgId', getOrganizationById);           
router.get('/:orgId/members', getOrganizationMembers); 
router.get('/:orgId/events', getOrganizationEvents);
router.post('/:orgId/events', createOrganizationEvent);

router.get('/events/:eventId/participants', getEventParticipants);
router.put('/events/:eventId/attendance',  markAttendance);
router.put('/events/:eventId/qualify', qualifyStudent);
router.put('/events/:eventId/rounds/:roundNumber/status',  updateRoundStatus);

module.exports = router;