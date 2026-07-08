const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate } = require('../middleware/auth');
const { authorize, tenantGuard } = require('../middleware/rbac');
const { validate, moodCheckinRules, chatMessageRules, paginationRules } = require('../middleware/validator');

// All routes require student role and tenant isolation
router.use(authenticate, authorize('student'), tenantGuard);

router.get('/dashboard', studentController.getDashboard);
router.post('/checkin', moodCheckinRules, validate, studentController.checkin);
router.get('/mood-history', paginationRules, validate, studentController.getMoodHistory);

// AI Chat
router.post('/ai/chat', chatMessageRules, validate, studentController.sendAIMessage);
router.get('/ai/conversations', studentController.getConversations);
router.get('/ai/conversations/:id', studentController.getConversation);

module.exports = router;
