const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificate.controller');

const { protect } = require('../middleware/auth.middleware'); 

router.post('/template/:eventId', certificateController.createTemplateMapping);
router.get('/templates/:eventId', certificateController.getEventTemplates);
router.delete('/template/:templateId', certificateController.deleteTemplateMapping); 
router.post('/preview', certificateController.previewTemplate); 
router.get('/verify/:code', certificateController.verifyCertificate);

router.post('/issue/:eventId', certificateController.issueCertificates);

router.get('/my-certificates', protect, certificateController.getMyCertificates);

module.exports = router;