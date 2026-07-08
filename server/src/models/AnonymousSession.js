const mongoose = require('mongoose');

const anonymousMessageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const anonymousSessionSchema = new mongoose.Schema({
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true,
    index: true,
  },
  studentAnonId: {
    type: String,
    required: true,
  },
  mentorAnonId: {
    type: String,
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    select: false,
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    select: false,
  },
  messages: [anonymousMessageSchema],
  status: {
    type: String,
    enum: ['pending', 'active', 'closed', 'expired'],
    default: 'pending',
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  mentorNotes: {
    type: String,
    maxlength: 5000,
    default: '',
    select: false,
  },
  closedAt: Date,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
}, {
  timestamps: true,
});

anonymousSessionSchema.index({ universityId: 1, status: 1 });
anonymousSessionSchema.index({ universityId: 1, studentId: 1 });
anonymousSessionSchema.index({ universityId: 1, mentorId: 1 });
anonymousSessionSchema.index({ studentAnonId: 1 });
anonymousSessionSchema.index({ mentorAnonId: 1 });

module.exports = mongoose.model('AnonymousSession', anonymousSessionSchema);
