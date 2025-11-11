/**
 * Response Handler Utility
 * Centralized response formatting following DRY principle
 * Single Responsibility: Only handles HTTP responses
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {*} data - Response data
 * @param {string} message - Optional message
 */
const sendSuccess = (res, statusCode, data, message = null) => {
  const response = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {string} error - Optional error details
 */
const sendError = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    message,
  };

  // Only include error details in development
  if (error && process.env.NODE_ENV === "development") {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data array
 * @param {Object} pagination - Pagination info
 */
const sendPaginated = (res, data, pagination) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: Math.ceil(pagination.total / pagination.limit),
    },
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
};

