const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

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
// Meal validation rules
exports.validateMeal = [
  body('name')
    .notEmpty()
    .withMessage('Meal name is required'),

  // Validate nutrition object matches Mongoose schema
  body('nutrition')
    .custom((value, { req }) => {
      const nutrition = req.body.nutrition || {};

      const checks = [
        { name: 'calories', value: nutrition.calories },
        { name: 'protein', value: nutrition.protein },
        { name: 'carbohydrates', value: nutrition.carbohydrates },
        { name: 'fats', value: nutrition.fats },
      ];

      // Missing required fields
      const missing = checks.filter((field) => field.value === undefined);
      if (missing.length) {
        throw new Error(
          `Missing required nutrition fields: ${missing
            .map((m) => m.name)
            .join(', ')}`
        );
      }

      // Validate numeric values
      const invalid = checks.filter((field) => isNaN(Number(field.value)));
      if (invalid.length) {
        throw new Error(
          `Nutrition fields must be numeric: ${invalid
            .map((m) => m.name)
            .join(', ')}`
        );
      }

      return true;
    }),

  body('mealType')
    .isIn(['breakfast', 'lunch', 'dinner', 'snack'])
    .withMessage(
      'Meal type must be breakfast, lunch, dinner, or snack'
    ),

  this.handleValidationErrors
];


// Meal Plan validation rules
exports.validateMealPlan = [
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('duration')
    .isInt({ min: 1, max: 30 })
    .withMessage('Duration must be between 1 and 30 days'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('days')
    .isArray({ min: 1 })
    .withMessage('Days must be a non-empty array'),
  body('days').custom((days) => {
    const invalidDay = days.find((day) => {
      if (day.date && isNaN(Date.parse(day.date))) {
        return true;
      }
      if (!day.meals || typeof day.meals !== 'object') {
        return true;
      }

      const requiredMeals = ['breakfast', 'lunch', 'dinner'];
      const missingMeal = requiredMeals.find((mealType) => {
        const mealEntry = day.meals[mealType];

        if (!mealEntry) {
          return true;
        }

        if (typeof mealEntry === 'string') {
          return !mongoose.Types.ObjectId.isValid(mealEntry);
        }

        return (
          !mealEntry.meal ||
          !mongoose.Types.ObjectId.isValid(mealEntry.meal)
        );
      });

      if (missingMeal) {
        return true;
      }

      if (day.meals.snacks) {
        const invalidSnack = day.meals.snacks.find((snack) => {
          if (typeof snack === 'string') {
            return !mongoose.Types.ObjectId.isValid(snack);
          }
          return (
            !snack.meal || !mongoose.Types.ObjectId.isValid(snack.meal)
          );
        });
        if (invalidSnack) {
          return true;
        }
      }

      return false;
    });

    if (invalidDay) {
      throw new Error(
        'Each day must include a valid date and meals with breakfast, lunch, dinner (and optional snacks) pointing to valid meal IDs'
      );
    }

    return true;
  }),
  body('targetNutrition')
    .custom((value) => {
      if (!value) {
        throw new Error('targetNutrition is required');
      }

      const dailyCalories =
        value.dailyCalories !== undefined ? value.dailyCalories : value.calories;

      if (dailyCalories === undefined || isNaN(Number(dailyCalories))) {
        throw new Error('targetNutrition.dailyCalories (or calories) must be provided as a number');
      }

      const macros = ['protein', 'carbohydrates', 'fats'];
      const invalidMacro = macros.find(
        (macro) =>
          value[macro] !== undefined && isNaN(Number(value[macro]))
      );

      if (invalidMacro) {
        throw new Error(`targetNutrition.${invalidMacro} must be a number`);
      }

      return true;
    }),
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