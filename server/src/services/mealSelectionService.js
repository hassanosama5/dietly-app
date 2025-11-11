/**
 * Meal Selection Service
 * Handles meal selection logic based on user preferences
 * Single Responsibility: Only handles meal selection
 */

const Meal = require("../models/Meal");

/**
 * Build query for meal selection based on user preferences
 * Uses functional composition (declarative)
 * @param {Object} user - User object
 * @param {string} mealType - Type of meal
 * @param {number} targetCalories - Target calories (optional)
 * @returns {Object} MongoDB query object
 */
const buildMealQuery = (user, mealType, targetCalories = null) => {
  // Start with base query (imperative)
  const query = {
    mealType,
    isActive: true,
  };

  // Apply dietary preferences (declarative: functional approach)
  if (user.dietaryPreferences && user.dietaryPreferences.length > 0) {
    query.dietaryTags = { $in: user.dietaryPreferences };
  }

  // Exclude allergens (declarative: functional filter)
  if (user.allergies && user.allergies.length > 0) {
    query.allergens = { $nin: user.allergies };
  }

  // Optional calorie filtering
  if (targetCalories) {
    const calorieRange = targetCalories * 0.2; // 20% variance
    query["nutrition.calories"] = {
      $gte: targetCalories - calorieRange,
      $lte: targetCalories + calorieRange,
    };
  }

  return query;
};

/**
 * Select meals for user based on preferences
 * Combines imperative and declarative approaches
 * @param {Object} user - User object
 * @param {string} mealType - Type of meal
 * @param {number} targetCalories - Target calories (optional)
 * @returns {Promise<Array>} Array of available meals
 */
const selectMealsForUser = async (user, mealType, targetCalories = null) => {
  // Build query (declarative)
  const query = buildMealQuery(user, mealType, targetCalories);

  // Get available meals (imperative: async operation)
  const availableMeals = await Meal.find(query);

  // Fallback logic if no meals found (imperative)
  if (availableMeals.length === 0) {
    const fallbackQuery = { mealType, isActive: true };
    if (user.allergies && user.allergies.length > 0) {
      fallbackQuery.allergens = { $nin: user.allergies };
    }
    return await Meal.find(fallbackQuery);
  }

  return availableMeals;
};

/**
 * Randomly select a meal from array
 * Imperative approach for randomness
 * @param {Array} meals - Array of meals
 * @returns {Object|null} Selected meal or null
 */
const selectRandomMeal = (meals) => {
  if (!meals || meals.length === 0) {
    return null;
  }

  // Imperative: random selection
  const randomIndex = Math.floor(Math.random() * meals.length);
  return meals[randomIndex];
};

/**
 * Select multiple random meals (for snacks)
 * Uses functional approach (declarative)
 * @param {Array} meals - Array of meals
 * @param {number} count - Number of meals to select
 * @returns {Array} Array of selected meals
 */
const selectRandomMeals = (meals, count) => {
  if (!meals || meals.length === 0 || count <= 0) {
    return [];
  }

  // Declarative: create array and map
  const selected = [];
  const maxCount = Math.min(count, meals.length);

  // Imperative: loop to select unique meals
  const usedIndices = new Set();
  while (selected.length < maxCount) {
    const randomIndex = Math.floor(Math.random() * meals.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      selected.push(meals[randomIndex]);
    }
  }

  return selected;
};

module.exports = {
  buildMealQuery,
  selectMealsForUser,
  selectRandomMeal,
  selectRandomMeals,
};

