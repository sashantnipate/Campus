const express = require('express');
const router = express.Router();
const { getStudentEvents, getEventDetails, registerForEvent, getMyRegistrations, getAllStudents, toggleStudentVerification, deleteStudent } = require('../controllers/student.controller');
const { protect } = require('../middleware/auth.middleware'); 

router.get('/events', protect, getStudentEvents);
router.get('/events/:eventId', protect, getEventDetails);
router.post('/events/:eventId/register', protect, registerForEvent);
router.get('/registrations/:userId', protect ,getMyRegistrations);
router.get('/', getAllStudents);
router.patch('/:id/verify', toggleStudentVerification);
router.delete('/:id', deleteStudent);
module.exports = router;