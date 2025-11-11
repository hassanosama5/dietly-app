/**
 * BMI Calculator Utility
 * Single Responsibility: Only handles BMI calculations
 */

/**
 * Calculate BMI (Body Mass Index)
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {number|null} BMI value or null if invalid input
 */
const calculateBMI = (weight, height) => {
  // Validation (imperative)
  if (!weight || !height || weight <= 0 || height <= 0) {
    return null;
  }

  // Convert height from cm to meters (imperative)
  const heightInMeters = height / 100;

  // Calculate BMI (imperative calculation)
  const bmi = weight / (heightInMeters * heightInMeters);

  // Round to 1 decimal place
  return Math.round(bmi * 10) / 10;
};

/**
 * Get BMI category
 * Declarative approach using mapping
 * @param {number} bmi - BMI value
 * @returns {string} BMI category
 */
const getBMICategory = (bmi) => {
  if (!bmi) return "unknown";

  // Declarative: category mapping
  const categories = [
    { max: 18.5, category: "underweight" },
    { max: 25, category: "normal" },
    { max: 30, category: "overweight" },
    { max: Infinity, category: "obese" },
  ];

  // Imperative: find category
  for (const { max, category } of categories) {
    if (bmi < max) {
      return category;
    }
  }

  return "obese";
};

module.exports = {
  calculateBMI,
  getBMICategory,
};

