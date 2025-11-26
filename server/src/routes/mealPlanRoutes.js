const express = require('express');
const router = express.Router();
const {
  getMealPlans,
  getMealPlan,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  generateMealPlan,
  getCurrentMealPlan,
  markMealConsumed,
  getMealPlanNutrition,
  getMealPlanProgress,
  getMealPlanSummary,
  stopMealPlan,
  getDailyMealStatus,
  getAdherenceAnalytics,
} = require('../controllers/mealPlanController');
const { protect } = require('../middleware/auth');
const { validateMealPlan, validateId } = require('../middleware/validation');

// Specific routes first
// @desc    Get user's meal plans
// @route   GET /api/v1/meal-plans
// @access  Private
router.get('/', protect, getMealPlans);

// @desc    Create manual meal plan
// @route   POST /api/v1/meal-plans
// @access  Private
router.post('/', protect, validateMealPlan, createMealPlan);

// @desc    Auto-generate personalized meal plan
// @route   POST /api/v1/meal-plans/generate
// @access  Private
router.post('/generate', protect, generateMealPlan);

// @desc    Get current active meal plan
// @route   GET /api/v1/meal-plans/current
// @access  Private
router.get('/current', protect, getCurrentMealPlan);

// @desc    Get adherence analytics (streaks, meal breakdown, patterns)
// @route   GET /api/v1/meal-plans/adherence-analytics
// @access  Private
router.get('/adherence-analytics', protect, getAdherenceAnalytics);

// @desc    Get adherence progress for plan
// @route   GET /api/v1/meal-plans/progress/:id
// @access  Private
router.get('/progress/:id', protect, validateId, getMealPlanProgress);

// @desc    Get weekly nutrition summary
// @route   GET /api/v1/meal-plans/summary/:id
// @access  Private
router.get('/summary/:id', protect, validateId, getMealPlanSummary);

// @desc    Get meal status for a single day
// @route   GET /api/v1/meal-plans/:id/daily-status
// @access  Private
router.get('/:id/daily-status', protect, validateId, getDailyMealStatus);

// Dynamic routes
// @desc    Get specific meal plan details
// @route   GET /api/v1/meal-plans/:id
// @access  Private
router.get('/:id', protect, validateId, getMealPlan);

// @desc    Update meal plan
// @route   PUT /api/v1/meal-plans/:id
// @access  Private
router.put('/:id', protect, validateId, updateMealPlan);

// @desc    Delete meal plan
// @route   DELETE /api/v1/meal-plans/:id
// @access  Private
router.delete('/:id', protect, validateId, deleteMealPlan);

// @desc    Mark meal as consumed
// @route   PUT /api/v1/meal-plans/:id/consume
// @access  Private
router.put('/:id/consume', protect, validateId, markMealConsumed);

// @desc    Stop an active meal plan
// @route   PUT /api/v1/meal-plans/:id/stop
// @access  Private
router.put('/:id/stop', protect, validateId, stopMealPlan);

// Legacy routes for compatibility
// @desc    Mark meal as consumed (alternative route)
// @route   PUT /api/v1/meal-plans/:id/meals/:mealType
// @access  Private
router.put('/:id/meals/:mealType', protect, validateId, markMealConsumed);

// @desc    Mark snack as consumed
// @route   PUT /api/v1/meal-plans/:id/meals/:mealType/snacks/:snackIndex
// @access  Private
router.put('/:id/meals/:mealType/snacks/:snackIndex', protect, validateId, markMealConsumed);

module.exports = router;