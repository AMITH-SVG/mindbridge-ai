const jwt = require('jsonwebtoken');
const { User, University, AuditLog } = require('../models');
const { generateOTP, hashOTP, verifyOTP, getOTPExpiry, isEmailAllowed, sanitizeUser } = require('../utils/helpers');
const { sendOTPEmail } = require('../utils/email');
const env = require('../config/env');

function generateAccessToken(user) {
  return jwt.sign({ userId: user._id, role: user.role, universityId: user.universityId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}
function generateRefreshToken(user) {
  return jwt.sign({ userId: user._id, type: 'refresh' }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
}

exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, universityId, registrationNumber, staffId, department } = req.body;
    const university = await University.findById(universityId);
    if (!university || !university.isActive || !university.isApproved) {
      return res.status(400).json({ success: false, message: 'University not found or not approved.' });
    }
    if (!isEmailAllowed(email, university.allowedDomains)) {
      return res.status(400).json({ success: false, message: 'Email domain not allowed. Use your official university email.' });
    }
    const existingUser = await User.findOne({ universityId, email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }
    if (role === 'student' && !registrationNumber) {
      return res.status(400).json({ success: false, message: 'Registration number is required for students.' });
    }
    if ((role === 'mentor' || role === 'counsellor') && !staffId) {
      return res.status(400).json({ success: false, message: 'Staff ID is required for faculty members.' });
    }
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const user = await User.create({
      universityId, email, passwordHash: password, firstName, lastName, role,
      registrationNumber: registrationNumber || null, staffId: staffId || null,
      department: department || null,
      otp: { code: otpHash, expiresAt: getOTPExpiry(), attempts: 0 },
    });
    await sendOTPEmail(email, otp, 'verification');
    await AuditLog.create({ universityId, userId: user._id, action: 'REGISTER', resource: 'User', ipAddress: req.ip, userAgent: req.get('user-agent') });
    res.status(201).json({ success: true, message: 'Registration successful. Please verify your email with the OTP sent.', data: { userId: user._id, email: user.email } });
  } catch (error) { next(error); }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+otp.code +otp.expiresAt +otp.attempts');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (!user.otp?.code) return res.status(400).json({ success: false, message: 'No OTP pending.' });
    if (user.otp.attempts >= 5) return res.status(429).json({ success: false, message: 'Too many OTP attempts. Request a new one.' });
    if (new Date() > user.otp.expiresAt) return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
    const isValid = await verifyOTP(otp, user.otp.code);
    if (!isValid) {
      user.otp.attempts += 1;
      await user.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
    user.isVerified = true;
    user.otp = { code: null, expiresAt: null, attempts: 0 };
    await user.save();
    await AuditLog.create({ universityId: user.universityId, userId: user._id, action: 'VERIFY_OTP', resource: 'User', ipAddress: req.ip });
    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      await AuditLog.create({ action: 'LOGIN_FAILED', resource: 'User', ipAddress: req.ip, metadata: { email, reason: 'User not found' } });
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated.' });
    if (!user.isVerified) return res.status(403).json({ success: false, message: 'Email not verified.' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await AuditLog.create({ universityId: user.universityId, userId: user._id, action: 'LOGIN_FAILED', ipAddress: req.ip });
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshTokens = user.refreshTokens.filter(t => t.expiresAt > new Date());
    user.refreshTokens.push({ token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), device: req.get('user-agent') || 'unknown' });
    if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5);
    user.lastLogin = new Date();
    await user.save();
    await AuditLog.create({ universityId: user.universityId, userId: user._id, action: 'LOGIN', resource: 'User', ipAddress: req.ip });
    res.json({ success: true, message: 'Login successful.', data: { user: sanitizeUser(user), accessToken, refreshToken } });
  } catch (error) { next(error); }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required.' });
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    const tokenExists = user.refreshTokens.find(t => t.token === refreshToken && t.expiresAt > new Date());
    if (!tokenExists) return res.status(401).json({ success: false, message: 'Refresh token expired or revoked.' });
    const newAccessToken = generateAccessToken(user);
    res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (req.user) {
      req.user.refreshTokens = req.user.refreshTokens.filter(t => t.token !== refreshToken);
      await req.user.save();
      await AuditLog.create({ universityId: req.user.universityId, userId: req.user._id, action: 'LOGOUT', ipAddress: req.ip });
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) { next(error); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: true, message: 'If an account exists, an OTP has been sent.' });
    const otp = generateOTP();
    user.otp = { code: await hashOTP(otp), expiresAt: getOTPExpiry(), attempts: 0 };
    await user.save();
    await sendOTPEmail(email, otp, 'password_reset');
    res.json({ success: true, message: 'If an account exists, an OTP has been sent.' });
  } catch (error) { next(error); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email }).select('+otp.code +otp.expiresAt +otp.attempts');
    if (!user || !user.otp?.code) return res.status(400).json({ success: false, message: 'Invalid request.' });
    if (new Date() > user.otp.expiresAt) return res.status(400).json({ success: false, message: 'OTP expired.' });
    const isValid = await verifyOTP(otp, user.otp.code);
    if (!isValid) return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    user.passwordHash = newPassword;
    user.otp = { code: null, expiresAt: null, attempts: 0 };
    user.passwordChangedAt = new Date();
    user.refreshTokens = [];
    await user.save();
    await AuditLog.create({ universityId: user.universityId, userId: user._id, action: 'PASSWORD_RESET', ipAddress: req.ip });
    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) { next(error); }
};

exports.getProfile = async (req, res) => {
  res.json({ success: true, data: { user: sanitizeUser(req.user) } });
};

exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: true, message: 'If an account exists, an OTP has been sent.' });
    const otp = generateOTP();
    user.otp = { code: await hashOTP(otp), expiresAt: getOTPExpiry(), attempts: 0 };
    await user.save();
    await sendOTPEmail(email, otp, 'verification');
    res.json({ success: true, message: 'OTP sent successfully.' });
  } catch (error) { next(error); }
};
