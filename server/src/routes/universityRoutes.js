const express = require('express');
const router = express.Router();
const universityController = require('../controllers/universityController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate, universityRules, paginationRules } = require('../middleware/validator');

// Public route for university self-registration
router.post('/', universityRules, validate, universityController.createUniversity);

// Super admin routes
router.use(authenticate, authorize('super_admin'));
router.get('/', paginationRules, validate, universityController.getAllUniversities);
router.get('/stats', universityController.getPlatformStats);
router.get('/:id', universityController.getUniversity);
router.patch('/:id', universityController.updateUniversity);
router.patch('/:id/approve', universityController.approveUniversity);
router.patch('/:id/deactivate', universityController.deactivateUniversity);

module.exports = router;
