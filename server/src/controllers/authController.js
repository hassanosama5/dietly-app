const User = require("../models/User");
const jwt = require("jsonwebtoken");
const calorieService = require("../services/calorieService");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const { validateRequired, validateEmail, validatePassword } = require("../utils/validationHelper");

// Generate JWT Token (utility function)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret_key", {
    expiresIn: "30d",
  });
};

// Format user response (declarative approach)
const formatUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    healthGoal: user.healthGoal,
    dailyCalorieTarget: user.dailyCalorieTarget,
  };
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      age,
      gender,
      height,
      currentWeight,
      targetWeight,
      healthGoal,
      activityLevel,
      dietaryPreferences,
      allergies,
    } = req.body;

    // Validation using utility (declarative approach)
    const requiredValidation = validateRequired(req.body, ["name", "email", "password"]);
    if (!requiredValidation.valid) {
      return sendError(
        res,
        400,
        `Missing required fields: ${requiredValidation.missing.join(", ")}`
      );
    }

    // Email validation (declarative)
    if (!validateEmail(email)) {
      return sendError(res, 400, "Please provide a valid email");
    }

    // Password validation (declarative)
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return sendError(res, 400, passwordValidation.message);
    }

    // Check if user exists (imperative: async operation)
    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 400, "User already exists with this email");
    }

    // Calculate daily calorie target using service (declarative composition)
    let dailyCalorieTarget = req.body.dailyCalorieTarget;
    if (!dailyCalorieTarget) {
      dailyCalorieTarget = calorieService.calculateDailyCalorieTarget({
        currentWeight,
        height,
        age,
        gender,
        activityLevel: activityLevel || "moderate",
        healthGoal: healthGoal || "maintain",
      });
    }

    // Create user (imperative: database operation)
    const user = await User.create({
      name,
      email,
      password,
      age,
      gender,
      height,
      currentWeight,
      targetWeight,
      healthGoal: healthGoal || "maintain",
      activityLevel: activityLevel || "moderate",
      dailyCalorieTarget,
      dietaryPreferences: dietaryPreferences || [],
      allergies: allergies || [],
    });

    // Generate token (imperative)
    const token = generateToken(user._id);

    // Response using utility (declarative)
    return sendSuccess(res, 201, {
      user: formatUserResponse(user),
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    return sendError(res, 500, "Server error during registration", error.message);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation using utility (declarative)
    const validation = validateRequired(req.body, ["email", "password"]);
    if (!validation.valid) {
      return sendError(
        res,
        400,
        `Missing required fields: ${validation.missing.join(", ")}`
      );
    }

    // Find user with password (imperative: async operation)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return sendError(res, 401, "Invalid credentials");
    }

    // Verify password (imperative: async comparison)
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, "Invalid credentials");
    }

    // Generate token (imperative)
    const token = generateToken(user._id);

    // Response using utility (declarative)
    return sendSuccess(res, 200, {
      user: formatUserResponse(user),
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, 500, "Server error during login", error.message);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // Find user (imperative: async operation)
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Response using utility (declarative)
    return sendSuccess(res, 200, user);
  } catch (error) {
    console.error("Get me error:", error);
    return sendError(res, 500, "Server error", error.message);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      height,
      currentWeight,
      targetWeight,
      healthGoal,
      activityLevel,
      dietaryPreferences,
      allergies,
    } = req.body;

    // Build update object (declarative: functional approach)
    const allowedFields = [
      "name",
      "age",
      "gender",
      "height",
      "currentWeight",
      "targetWeight",
      "healthGoal",
      "activityLevel",
      "dietaryPreferences",
      "allergies",
    ];

    // Declarative: reduce to build update object
    const updateFields = allowedFields.reduce((acc, field) => {
      if (req.body[field] !== undefined) {
        acc[field] = req.body[field];
      }
      return acc;
    }, {});

    // Get current user for recalculation (imperative)
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return sendError(res, 404, "User not found");
    }

    // Recalculate calorie target if relevant fields changed (declarative composition)
    const needsRecalculation = [
      currentWeight,
      height,
      age,
      gender,
      activityLevel,
      healthGoal,
    ].some((field) => field !== undefined);

    if (needsRecalculation) {
      const userData = {
        currentWeight: updateFields.currentWeight || currentUser.currentWeight,
        height: updateFields.height || currentUser.height,
        age: updateFields.age || currentUser.age,
        gender: updateFields.gender || currentUser.gender,
        activityLevel: updateFields.activityLevel || currentUser.activityLevel,
        healthGoal: updateFields.healthGoal || currentUser.healthGoal,
      };

      // Use service for calculation (declarative)
      const calculatedTarget = calorieService.calculateDailyCalorieTarget(userData);
      if (calculatedTarget) {
        updateFields.dailyCalorieTarget = calculatedTarget;
      }
    }

    updateFields.updatedAt = Date.now();

    // Update user (imperative: database operation)
    const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Response using utility (declarative)
    return sendSuccess(res, 200, user);
  } catch (error) {
    console.error("Update profile error:", error);
    return sendError(res, 500, "Server error updating profile", error.message);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation using utility (declarative)
    const validation = validateRequired(req.body, ["currentPassword", "newPassword"]);
    if (!validation.valid) {
      return sendError(
        res,
        400,
        `Missing required fields: ${validation.missing.join(", ")}`
      );
    }

    // Password strength validation (declarative)
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return sendError(res, 400, passwordValidation.message);
    }

    // Find user with password (imperative: async operation)
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Verify current password (imperative: async comparison)
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 401, "Current password is incorrect");
    }

    // Update password (imperative: mutation)
    user.password = newPassword;
    await user.save();

    // Response using utility (declarative)
    return sendSuccess(res, 200, null, "Password updated successfully");
  } catch (error) {
    console.error("Change password error:", error);
    return sendError(res, 500, "Server error changing password", error.message);
  }
};

