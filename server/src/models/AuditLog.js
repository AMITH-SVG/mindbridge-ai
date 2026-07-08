const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
      'REGISTER', 'VERIFY_OTP', 'PASSWORD_RESET',
      'PROFILE_UPDATE', 'ROLE_CHANGE',
      'UNIVERSITY_CREATE', 'UNIVERSITY_UPDATE', 'UNIVERSITY_DELETE',
      'EXPORT_DATA', 'VIEW_ANALYTICS',
      'SESSION_CREATE', 'SESSION_CLOSE',
      'CRITICAL_RISK_DETECTED',
      'SYSTEM_ERROR',
    ],
  },
  resource: {
    type: String,
    default: null,
  },
  resourceId: {
    type: String,
    default: null,
  },
  ipAddress: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info',
  },
}, {
  timestamps: true,
});

auditLogSchema.index({ universityId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
