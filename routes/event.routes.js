// routes/event.routes.js
const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');
const { createEvent, getAllEvents, updateEvent, saveCertificateConfig } = require('../controllers/event.controller');

router.get('/list', getAllEvents);
router.post(
  '/create', 
  upload.fields([
    { name: 'poster', maxCount: 1 }, 
    { name: 'sponsors', maxCount: 5 }
  ]), 
  createEvent
);
router.put('/update/:id', upload.fields([{ name: 'poster', maxCount: 1 }]), updateEvent);
router.put('/:eventId/certificate-config', saveCertificateConfig);
module.exports = router;