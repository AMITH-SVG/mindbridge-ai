const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, registerRules, loginRules, otpRules, forgotPasswordRules, resetPasswordRules } = require('../middleware/validator');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

router.post('/register', authLimiter, registerRules, validate, authController.register);
router.post('/login', authLimiter, loginRules, validate, authController.login);
router.post('/verify-otp', authLimiter, otpRules, validate, authController.verifyOTP);
router.post('/resend-otp', otpLimiter, forgotPasswordRules, validate, authController.resendOTP);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', otpLimiter, forgotPasswordRules, validate, authController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordRules, validate, authController.resetPassword);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
