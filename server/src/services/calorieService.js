/**
 * Calorie Calculation Service
 * Handles BMR and TDEE calculations following SOLID principles
 * Single Responsibility: Only handles calorie-related calculations
 */

// Activity multipliers configuration (declarative approach)
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Goal adjustment factors (declarative configuration)
const GOAL_ADJUSTMENTS = {
  lose: -500,
  gain: 500,
  maintain: 0,
};

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - Gender (male, female, other)
 * @returns {number} BMR in calories
 */
const calculateBMR = (weight, height, age, gender) => {
  // Base calculation (imperative style)
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;

  // Gender-specific adjustments (imperative conditional)
  if (gender === "male") {
    return baseBMR + 5;
  } else if (gender === "female") {
    return baseBMR - 161;
  } else {
    return baseBMR - 50;
  }
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Activity level
 * @returns {number} TDEE in calories
 */
const calculateTDEE = (bmr, activityLevel) => {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.moderate;
  return bmr * multiplier;
};

/**
 * Calculate daily calorie target based on health goal
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {string} healthGoal - Health goal (lose, gain, maintain)
 * @returns {number} Daily calorie target
 */
const adjustForGoal = (tdee, healthGoal) => {
  const adjustment = GOAL_ADJUSTMENTS[healthGoal] || GOAL_ADJUSTMENTS.maintain;
  return Math.round(tdee + adjustment);
};

/**
 * Main function to calculate daily calorie target
 * Uses composition of smaller functions (declarative approach)
 * @param {Object} userData - User data object
 * @returns {number|null} Daily calorie target or null if insufficient data
 */
const calculateDailyCalorieTarget = (userData) => {
  const { currentWeight, height, age, gender, activityLevel, healthGoal } = userData;

  // Validation (imperative style)
  if (!currentWeight || !height || !age || !gender) {
    return null;
  }

  // Functional composition (declarative approach)
  const bmr = calculateBMR(currentWeight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel || "moderate");
  const target = adjustForGoal(tdee, healthGoal || "maintain");

  return target;
};

module.exports = {
  calculateBMR,
  calculateTDEE,
  adjustForGoal,
  calculateDailyCalorieTarget,
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS,
};

