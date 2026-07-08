const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');
const { authenticate } = require('../middleware/auth');
const { authorize, tenantGuard } = require('../middleware/rbac');

router.use(authenticate, authorize('mentor', 'counsellor'), tenantGuard);

router.get('/dashboard', mentorController.getDashboard);
router.get('/trends', mentorController.getWellnessTrends);

module.exports = router;
