const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    select: false,
  },
  counsellorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scheduledAt: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    default: 30,
    min: 15,
    max: 120,
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled',
  },
  type: {
    type: String,
    enum: ['initial', 'follow_up', 'crisis', 'regular'],
    default: 'regular',
  },
  notes: {
    type: String,
    maxlength: 5000,
    default: '',
  },
  outcome: {
    type: String,
    maxlength: 2000,
    default: '',
  },
}, {
  timestamps: true,
});

appointmentSchema.index({ universityId: 1, counsellorId: 1, scheduledAt: 1 });
appointmentSchema.index({ universityId: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
