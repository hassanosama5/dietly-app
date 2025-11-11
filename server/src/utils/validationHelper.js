/**
 * Validation Helper Utility
 * Centralized validation functions
 * Single Responsibility: Only handles validation
 */

/**
 * Validate required fields
 * Declarative approach using array methods
 * @param {Object} data - Data object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} { valid: boolean, missing: Array }
 */
const validateRequired = (data, requiredFields) => {
  // Declarative: filter missing fields
  const missing = requiredFields.filter((field) => !data[field]);

  return {
    valid: missing.length === 0,
    missing,
  };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
const validateEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum length
 * @returns {Object} { valid: boolean, message: string }
 */
const validatePassword = (password, minLength = 6) => {
  if (!password) {
    return { valid: false, message: "Password is required" };
  }

  if (password.length < minLength) {
    return {
      valid: false,
      message: `Password must be at least ${minLength} characters`,
    };
  }

  return { valid: true, message: "Password is valid" };
};

/**
 * Validate numeric range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if valid
 */
const validateRange = (value, min, max) => {
  return value >= min && value <= max;
};

/**
 * Sanitize array input (ensure it's an array)
 * Declarative approach
 * @param {*} input - Input to sanitize
 * @returns {Array} Array
 */
const sanitizeArray = (input) => {
  if (Array.isArray(input)) {
    return input;
  }
  return input ? [input] : [];
};

module.exports = {
  validateRequired,
  validateEmail,
  validatePassword,
  validateRange,
  sanitizeArray,
};

