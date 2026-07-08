const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const env = require('../config/env');

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

async function hashOTP(otp) {
  return bcrypt.hash(otp, 10);
}

async function verifyOTP(otp, hash) {
  return bcrypt.compare(otp, hash);
}

function generateAnonId(prefix) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(crypto.randomInt(chars.length));
  }
  return `${prefix}-${id}`;
}

function getOTPExpiry() {
  return new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);
}

function isEmailAllowed(email, allowedDomains) {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  const blocked = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com', 'icloud.com', 'mail.com', 'yandex.com', 'aol.com'];
  if (blocked.includes(domain)) return false;
  return allowedDomains.some(d => domain === d.toLowerCase() || domain.endsWith('.' + d.toLowerCase()));
}

function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  delete obj.otp;
  delete obj.refreshTokens;
  delete obj.__v;
  return obj;
}

module.exports = { generateOTP, hashOTP, verifyOTP, generateAnonId, getOTPExpiry, isEmailAllowed, sanitizeUser };
