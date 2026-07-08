const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: [true, 'University ID is required'],
    index: true,
  },
  role: {
    type: String,
    enum: ['super_admin', 'university_admin', 'mentor', 'counsellor', 'student'],
    required: [true, 'Role is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    select: false,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  registrationNumber: {
    type: String,
    trim: true,
    default: null,
  },
  staffId: {
    type: String,
    trim: true,
    default: null,
  },
  department: {
    type: String,
    trim: true,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
  otp: {
    code: { type: String, select: false },
    expiresAt: { type: Date, select: false },
    attempts: { type: Number, default: 0, select: false },
  },
  refreshTokens: [{
    token: { type: String },
    expiresAt: { type: Date },
    device: { type: String, default: 'unknown' },
    createdAt: { type: Date, default: Date.now },
  }],
  lastLogin: Date,
  passwordChangedAt: Date,
}, {
  timestamps: true,
});

// Compound indexes for multi-tenant queries
userSchema.index({ universityId: 1, email: 1 }, { unique: true });
userSchema.index({ universityId: 1, role: 1 });
userSchema.index({ universityId: 1, registrationNumber: 1 });
userSchema.index({ universityId: 1, staffId: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Get full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
