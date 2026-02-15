const express = require('express');

const {
  sendOtp,
  verifyOtp,
  registerStudent,
  loginStudent,
  registerAdmin,
  loginAdmin,
  sendForgotPasswordOtp,
  resetPassword,
  verifyPasswordResetOtp,
  google
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.post('/register-admin', registerAdmin);
router.post('/login-admin', loginAdmin);
router.post('/forgot-password', sendForgotPasswordOtp);
router.post('/reset-password-otp', verifyPasswordResetOtp);
router.post('/reset-password', resetPassword);
router.post('/google', google);

router.get('/profile', protect, (req, res) => {
    res.json({ 
        message: "This is a private profile", 
        user: req.user 
    });
});

module.exports = router;
