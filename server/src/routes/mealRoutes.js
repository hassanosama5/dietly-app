const express = require('express');
const router = express.Router();

// @desc    Get all meals (filterable)
// @route   GET /api/v1/meals
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Get all meals route' });
});

// @desc    Search meals by name/ingredients
// @route   GET /api/v1/meals/search
// @access  Public
router.get('/search', (req, res) => {
  res.status(200).json({ success: true, message: 'Search meals route' });
});

// @desc    Get meals by type (breakfast, lunch, dinner, snack)
// @route   GET /api/v1/meals/type/:mealType
// @access  Public
router.get('/type/:mealType', (req, res) => {
  res.status(200).json({ success: true, message: 'Get meals by type route' });
});

// @desc    Get meals by dietary preference
// @route   GET /api/v1/meals/diet/:dietType
// @access  Public
router.get('/diet/:dietType', (req, res) => {
  res.status(200).json({ success: true, message: 'Get meals by diet route' });
});

// @desc    Get meal suggestions for user
// @route   GET /api/v1/meals/suggestions
// @access  Private
router.get('/suggestions', (req, res) => {
  res.status(200).json({ success: true, message: 'Get meal suggestions route' });
});

// @desc    Create new meal
// @route   POST /api/v1/meals
// @access  Admin
router.post('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Create meal route' });
});

// @desc    Get specific meal details
// @route   GET /api/v1/meals/:id
// @access  Public
router.get('/:id', (req, res) => {
  res.status(200).json({ success: true, message: 'Get meal by ID route' });
});

// @desc    Update meal
// @route   PUT /api/v1/meals/:id
// @access  Admin
router.put('/:id', (req, res) => {
  res.status(200).json({ success: true, message: 'Update meal route' });
});

// @desc    Delete meal
// @route   DELETE /api/v1/meals/:id
// @access  Admin
router.delete('/:id', (req, res) => {
  res.status(200).json({ success: true, message: 'Delete meal route' });
});

module.exports = router;