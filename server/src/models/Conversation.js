const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['ai', 'student'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  emotion: {
    type: String,
    enum: ['happy', 'neutral', 'sad', 'angry', 'anxious', 'burnout', 'lonely', 'depressed', 'confused', 'overwhelmed', 'hopeful', null],
    default: null,
  },
  sentiment: {
    score: { type: Number, default: 0 },
    comparative: { type: Number, default: 0 },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const conversationSchema = new mongoose.Schema({
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
  messages: [messageSchema],
  sessionEmotion: {
    type: String,
    enum: ['happy', 'neutral', 'sad', 'angry', 'anxious', 'burnout', 'lonely', 'depressed', 'confused', 'overwhelmed', 'hopeful'],
    default: 'neutral',
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
  },
  flowState: {
    type: String,
    enum: ['greeting', 'checkin', 'emotion_detection', 'dynamic_questions', 'guidance', 'motivation', 'mentor_offer', 'counsellor_recommend', 'crisis', 'complete'],
    default: 'greeting',
  },
  context: {
    detectedIssues: [String],
    askedQuestions: [String],
    emotionHistory: [String],
    questionCount: { type: Number, default: 0 },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

conversationSchema.index({ universityId: 1, studentId: 1, createdAt: -1 });
conversationSchema.index({ universityId: 1, isActive: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
