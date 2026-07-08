const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const mentoringRoutes = require('./mentoringRoutes');
const mentorRoutes = require('./mentorRoutes');
const adminRoutes = require('./adminRoutes');
const universityRoutes = require('./universityRoutes');

router.use('/auth', authRoutes);
router.use('/student', studentRoutes);
router.use('/mentoring', mentoringRoutes);
router.use('/mentor', mentorRoutes);
router.use('/admin', adminRoutes);
router.use('/universities', universityRoutes);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'MindBridge AI API is running.', timestamp: new Date() });
});

module.exports = router;
