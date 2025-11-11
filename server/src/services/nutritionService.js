/**
 * Nutrition Calculation Service
 * Handles nutrition-related calculations
 * Single Responsibility: Only handles nutrition calculations
 */

/**
 * Calculate nutrition totals for a meal with servings
 * Uses functional approach (declarative)
 * @param {Object} meal - Meal object with nutrition data
 * @param {number} servings - Number of servings
 * @returns {Object} Nutrition totals
 */
const calculateNutrition = (meal, servings = 1) => {
  if (!meal || !meal.nutrition) {
    return {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fats: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };
  }

  // Declarative approach: map nutrition values
  const nutritionFields = [
    "calories",
    "protein",
    "carbohydrates",
    "fats",
    "fiber",
    "sugar",
    "sodium",
  ];

  // Functional transformation (declarative)
  return nutritionFields.reduce((acc, field) => {
    acc[field] = (meal.nutrition[field] || 0) * servings;
    return acc;
  }, {});
};

/**
 * Calculate total nutrition for multiple meals
 * Uses functional programming (declarative)
 * @param {Array} meals - Array of meal objects with servings
 * @returns {Object} Total nutrition
 */
const calculateTotalNutrition = (meals) => {
  // Declarative approach: reduce meals to totals
  return meals.reduce(
    (totals, mealData) => {
      const { meal, servings = 1 } = mealData;
      const nutrition = calculateNutrition(meal, servings);

      // Imperative accumulation
      Object.keys(totals).forEach((key) => {
        totals[key] += nutrition[key] || 0;
      });

      return totals;
    },
    {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fats: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    }
  );
};

/**
 * Calculate average nutrition from daily nutrition array
 * Declarative functional approach
 * @param {Array} dailyNutrition - Array of daily nutrition objects
 * @returns {Object} Average nutrition
 */
const calculateAverageNutrition = (dailyNutrition) => {
  if (!dailyNutrition || dailyNutrition.length === 0) {
    return null;
  }

  // Declarative: map and reduce
  const totals = dailyNutrition.reduce(
    (acc, day) => {
      Object.keys(day.nutrition).forEach((key) => {
        acc[key] = (acc[key] || 0) + (day.nutrition[key] || 0);
      });
      return acc;
    },
    {}
  );

  // Imperative: calculate averages
  const count = dailyNutrition.length;
  const averages = {};
  Object.keys(totals).forEach((key) => {
    averages[key] = Math.round(totals[key] / count);
  });

  return averages;
};

/**
 * Calculate target nutrition based on calorie target
 * @param {number} dailyCalories - Daily calorie target
 * @returns {Object} Target nutrition breakdown
 */
const calculateTargetNutrition = (dailyCalories) => {
  return {
    dailyCalories,
    protein: Math.round((dailyCalories * 0.3) / 4), // 30% from protein
    carbohydrates: Math.round((dailyCalories * 0.45) / 4), // 45% from carbs
    fats: Math.round((dailyCalories * 0.25) / 9), // 25% from fats
  };
};

module.exports = {
  calculateNutrition,
  calculateTotalNutrition,
  calculateAverageNutrition,
  calculateTargetNutrition,
};

