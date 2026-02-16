const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

router.get('/stats', dashboardController.getDashboardStats);


router.get('/events', dashboardController.getEventsTable);

router.put('/event-status/:id', dashboardController.updateEventStatus);

module.exports = router;