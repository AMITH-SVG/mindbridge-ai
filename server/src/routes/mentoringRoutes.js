const express = require('express');
const router = express.Router();
const mentoringController = require('../controllers/mentoringController');
const { authenticate } = require('../middleware/auth');
const { authorize, tenantGuard } = require('../middleware/rbac');
const { validate, chatMessageRules } = require('../middleware/validator');

router.use(authenticate, tenantGuard);

// Student routes
router.post('/request', authorize('student'), mentoringController.requestSession);
router.get('/student/sessions', authorize('student'), mentoringController.getStudentSessions);

// Mentor routes
router.get('/mentor/sessions', authorize('mentor', 'counsellor'), mentoringController.getMentorSessions);
router.post('/:id/notes', authorize('mentor', 'counsellor'), mentoringController.addMentorNotes);

// Shared routes (both student and mentor can access their sessions)
router.get('/:id/messages', authorize('student', 'mentor', 'counsellor'), mentoringController.getSessionMessages);
router.post('/:id/message', authorize('student', 'mentor', 'counsellor'), chatMessageRules, validate, mentoringController.sendMessage);
router.patch('/:id/close', authorize('student', 'mentor', 'counsellor'), mentoringController.closeSession);

module.exports = router;
