const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize, tenantGuard } = require('../middleware/rbac');
const { validate, paginationRules } = require('../middleware/validator');

router.use(authenticate, authorize('university_admin', 'super_admin'), tenantGuard);

router.get('/dashboard', adminController.getDashboard);
router.get('/students', paginationRules, validate, adminController.getStudents);
router.get('/mentors', adminController.getMentors);
router.get('/reports', adminController.getReports);
router.get('/export', adminController.exportCSV);
router.get('/audit-logs', paginationRules, validate, adminController.getAuditLogs);

module.exports = router;
