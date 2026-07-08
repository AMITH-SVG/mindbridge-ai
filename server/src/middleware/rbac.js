/**
 * Role-Based Access Control middleware.
 * Restricts route access to specified roles.
 * Must be used AFTER the authenticate middleware.
 *
 * Usage: authorize('admin', 'super_admin')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource.',
      });
    }

    next();
  };
};

/**
 * Tenant isolation middleware.
 * Ensures users can only access resources within their own university.
 * Must be used AFTER the authenticate middleware.
 */
const tenantGuard = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  // Super admins can access any tenant
  if (req.user.role === 'super_admin') {
    return next();
  }

  // For routes with :universityId param, verify match
  if (req.params.universityId) {
    if (req.user.universityId.toString() !== req.params.universityId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Cross-tenant access is not permitted.',
      });
    }
  }

  next();
};

module.exports = { authorize, tenantGuard };
