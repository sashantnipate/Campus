const express = require('express');
const router = express.Router();
const { getStudentEvents, getEventDetails, registerForEvent, getMyRegistrations } = require('../controllers/student.controller');
const { protect } = require('../middleware/auth.middleware'); 

router.get('/events', protect, getStudentEvents);
router.get('/events/:eventId', protect, getEventDetails);
router.post('/events/:eventId/register', protect, registerForEvent);
router.get('/registrations/:userId', protect ,getMyRegistrations);
module.exports = router;