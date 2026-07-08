const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'University name is required'],
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  logo: {
    type: String,
    default: null,
  },
  branding: {
    primaryColor: { type: String, default: '#4F46E5' },
    secondaryColor: { type: String, default: '#7C3AED' },
  },
  allowedDomains: {
    type: [String],
    required: [true, 'At least one email domain is required'],
    validate: {
      validator: (v) => v.length > 0,
      message: 'At least one allowed email domain must be specified',
    },
  },
  address: {
    city: String,
    state: String,
    country: { type: String, default: 'India' },
  },
  contactEmail: {
    type: String,
    required: true,
  },
  contactPhone: String,
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'professional', 'enterprise'],
      default: 'free',
    },
    expiresAt: Date,
  },
  settings: {
    maxStudents: { type: Number, default: 5000 },
    maxMentors: { type: Number, default: 100 },
    aiEnabled: { type: Boolean, default: true },
    anonymousMentoringEnabled: { type: Boolean, default: true },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

universitySchema.index({ slug: 1 });
universitySchema.index({ isActive: 1, isApproved: 1 });

module.exports = mongoose.model('University', universitySchema);
