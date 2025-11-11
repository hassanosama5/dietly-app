const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// Auth validation rules
exports.validateRegister = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  this.handleValidationErrors
];

exports.validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .exists()
    .withMessage('Password is required'),
  this.handleValidationErrors
];

// User validation rules
exports.validateUserUpdate = [
  body('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('healthGoals')
    .optional()
    .isArray()
    .withMessage('Health goals must be an array'),
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),
  this.handleValidationErrors
];

// Meal validation rules
exports.validateMeal = [
  body('name')
    .notEmpty()
    .withMessage('Meal name is required'),
  body('calories')
    .isNumeric()
    .withMessage('Calories must be a number'),
  body('protein')
    .isNumeric()
    .withMessage('Protein must be a number'),
  body('carbs')
    .isNumeric()
    .withMessage('Carbs must be a number'),
  body('fat')
    .isNumeric()
    .withMessage('Fat must be a number'),
  body('mealType')
    .isIn(['breakfast', 'lunch', 'dinner', 'snack'])
    .withMessage('Meal type must be breakfast, lunch, dinner, or snack'),
  this.handleValidationErrors
];

// Meal Plan validation rules
exports.validateMealPlan = [
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('meals')
    .isArray()
    .withMessage('Meals must be an array'),
  this.handleValidationErrors
];

// Progress validation rules
exports.validateProgress = [
  body('weight')
    .isNumeric()
    .withMessage('Weight must be a number'),
  body('height')
    .optional()
    .isNumeric()
    .withMessage('Height must be a number'),
  body('bmi')
    .optional()
    .isNumeric()
    .withMessage('BMI must be a number'),
  body('energyLevel')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Energy level must be between 1 and 10'),
  this.handleValidationErrors
];

// ID validation
exports.validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  this.handleValidationErrors
];