const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true,
    index: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  mood: {
    type: String,
    enum: ['happy', 'neutral', 'sad', 'angry', 'anxious', 'burnout', 'lonely', 'depressed', 'confused', 'overwhelmed', 'hopeful'],
    required: true,
  },
  scores: {
    stress: { type: Number, min: 0, max: 100, default: 50 },
    anxiety: { type: Number, min: 0, max: 100, default: 50 },
    burnout: { type: Number, min: 0, max: 100, default: 50 },
    motivation: { type: Number, min: 0, max: 100, default: 50 },
    confidence: { type: Number, min: 0, max: 100, default: 50 },
    sleepQuality: { type: Number, min: 0, max: 100, default: 50 },
    academicPressure: { type: Number, min: 0, max: 100, default: 50 },
    socialConnection: { type: Number, min: 0, max: 100, default: 50 },
  },
  notes: {
    type: String,
    maxlength: 1000,
    default: '',
  },
  source: {
    type: String,
    enum: ['checkin', 'ai_detected', 'manual'],
    default: 'checkin',
  },
}, {
  timestamps: true,
});

moodEntrySchema.index({ universityId: 1, studentId: 1, date: -1 });
moodEntrySchema.index({ universityId: 1, date: -1 });

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
