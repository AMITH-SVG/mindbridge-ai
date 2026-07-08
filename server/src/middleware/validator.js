const { validationResult, body, param, query } = require('express-validator');

/**
 * Process validation results and return errors if any.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

// --- Auth Validation Rules ---

const registerRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('firstName').trim().notEmpty().withMessage('First name is required').escape(),
  body('lastName').trim().notEmpty().withMessage('Last name is required').escape(),
  body('role')
    .isIn(['student', 'mentor', 'counsellor'])
    .withMessage('Invalid role specified'),
  body('universityId').isMongoId().withMessage('Valid university ID is required'),
  body('registrationNumber')
    .optional()
    .trim()
    .escape(),
  body('staffId')
    .optional()
    .trim()
    .escape(),
  body('department')
    .optional()
    .trim()
    .escape(),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const otpRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
];

const forgotPasswordRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

const resetPasswordRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

// --- University Validation Rules ---

const universityRules = [
  body('name').trim().notEmpty().withMessage('University name is required').escape(),
  body('allowedDomains')
    .isArray({ min: 1 })
    .withMessage('At least one email domain is required'),
  body('allowedDomains.*')
    .trim()
    .notEmpty()
    .withMessage('Domain cannot be empty'),
  body('contactEmail').isEmail().withMessage('Valid contact email is required'),
];

// --- Mood Check-in Rules ---

const moodCheckinRules = [
  body('mood')
    .isIn(['happy', 'neutral', 'sad', 'angry', 'anxious', 'burnout', 'lonely', 'depressed', 'confused', 'overwhelmed', 'hopeful'])
    .withMessage('Invalid mood value'),
  body('scores.stress').optional().isInt({ min: 0, max: 100 }),
  body('scores.anxiety').optional().isInt({ min: 0, max: 100 }),
  body('scores.burnout').optional().isInt({ min: 0, max: 100 }),
  body('scores.motivation').optional().isInt({ min: 0, max: 100 }),
  body('scores.confidence').optional().isInt({ min: 0, max: 100 }),
  body('scores.sleepQuality').optional().isInt({ min: 0, max: 100 }),
  body('notes').optional().trim().isLength({ max: 1000 }),
];

// --- Chat Rules ---

const chatMessageRules = [
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 5000 }),
  body('conversationId').optional().isMongoId(),
];

// --- Pagination Rules ---

const paginationRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  otpRules,
  forgotPasswordRules,
  resetPasswordRules,
  universityRules,
  moodCheckinRules,
  chatMessageRules,
  paginationRules,
};
