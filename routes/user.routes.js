const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');


router.get('/:userId', userController.getUserProfile);


router.put('/:userId', userController.updateUserProfile);

module.exports = router;