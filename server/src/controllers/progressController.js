const Progress = require("../models/Progress");
const User = require("../models/User");
const { calculateBMI } = require("../utils/bmiCalculator");
const { sendSuccess, sendError, sendPaginated } = require("../utils/responseHandler");
const { validateRequired } = require("../utils/validationHelper");

// @desc    Create or update progress entry
// @route   POST /api/progress
// @access  Private
exports.createProgress = async (req, res) => {
  try {
    const {
      date,
      weight,
      energyLevel,
      measurements,
      activityMinutes,
      waterIntake,
      sleepHours,
      mood,
      notes,
    } = req.body;

    // Validation using utility (declarative)
    const validation = validateRequired(req.body, ["weight"]);
    if (!validation.valid) {
      return sendError(
        res,
        400,
        `Missing required fields: ${validation.missing.join(", ")}`
      );
    }

    // Get user (imperative: async operation)
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Prepare date (imperative: date manipulation)
    const progressDate = date ? new Date(date) : new Date();
    progressDate.setHours(0, 0, 0, 0);

    // Calculate BMI using utility (declarative: service call)
    const bmi = calculateBMI(weight, user.height);

    // Check if entry exists (imperative: async query)
    let progress = await Progress.findOne({
      user: req.user.id,
      date: progressDate,
    });

    // Update or create (imperative: conditional mutation)
    if (progress) {
      // Declarative: object update using spread
      Object.assign(progress, {
        weight,
        bmi,
        ...(energyLevel !== undefined && { energyLevel }),
        ...(measurements && { measurements }),
        ...(activityMinutes !== undefined && { activityMinutes }),
        ...(waterIntake !== undefined && { waterIntake }),
        ...(sleepHours !== undefined && { sleepHours }),
        ...(mood && { mood }),
        ...(notes && { notes }),
        updatedAt: Date.now(),
      });
      await progress.save();
    } else {
      // Create new entry (imperative: database operation)
      progress = await Progress.create({
        user: req.user.id,
        date: progressDate,
        weight,
        bmi,
        energyLevel,
        measurements,
        activityMinutes: activityMinutes || 0,
        waterIntake: waterIntake || 0,
        sleepHours: sleepHours || 0,
        mood,
        notes,
      });
    }

    // Update user's current weight if today (imperative: date comparison)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (progressDate.getTime() === today.getTime()) {
      user.currentWeight = weight;
      await user.save();
    }

    // Response using utility (declarative)
    return sendSuccess(res, 201, progress);
  } catch (error) {
    console.error("Create progress error:", error);
    if (error.code === 11000) {
      return sendError(res, 400, "Progress entry already exists for this date");
    }
    return sendError(res, 500, "Server error creating progress entry", error.message);
  }
};

// @desc    Get all progress entries for user
// @route   GET /api/progress
// @access  Private
exports.getProgress = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    // Build query (declarative: functional composition)
    const query = { user: req.user.id };

    // Date range filtering (imperative: conditional building)
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Pagination (imperative: calculations)
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Database operations (imperative: async)
    const progress = await Progress.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Progress.countDocuments(query);

    // Response using utility (declarative)
    return sendPaginated(res, progress, {
      page: pageNum,
      limit: limitNum,
      total,
    });
  } catch (error) {
    console.error("Get progress error:", error);
    return sendError(res, 500, "Server error fetching progress", error.message);
  }
};

// @desc    Get single progress entry
// @route   GET /api/progress/:id
// @access  Private
exports.getProgressEntry = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress entry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error("Get progress entry error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching progress entry",
      error: error.message,
    });
  }
};

// @desc    Update progress entry
// @route   PUT /api/progress/:id
// @access  Private
exports.updateProgress = async (req, res) => {
  try {
    let progress = await Progress.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress entry not found",
      });
    }

    const user = await User.findById(req.user.id);
    const { weight, energyLevel, measurements, activityMinutes, waterIntake, sleepHours, mood, notes } = req.body;

    // Recalculate BMI if weight or height changed
    if (weight || (weight && user.height)) {
      const newWeight = weight || progress.weight;
      const bmi = calculateBMI(newWeight, user.height);
      if (bmi) progress.bmi = bmi;
    }

    // Update fields
    if (weight !== undefined) progress.weight = weight;
    if (energyLevel !== undefined) progress.energyLevel = energyLevel;
    if (measurements) progress.measurements = measurements;
    if (activityMinutes !== undefined) progress.activityMinutes = activityMinutes;
    if (waterIntake !== undefined) progress.waterIntake = waterIntake;
    if (sleepHours !== undefined) progress.sleepHours = sleepHours;
    if (mood) progress.mood = mood;
    if (notes !== undefined) progress.notes = notes;

    progress.updatedAt = Date.now();
    await progress.save();

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating progress",
      error: error.message,
    });
  }
};

// @desc    Delete progress entry
// @route   DELETE /api/progress/:id
// @access  Private
exports.deleteProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress entry not found",
      });
    }

    await progress.deleteOne();

    res.status(200).json({
      success: true,
      message: "Progress entry deleted successfully",
    });
  } catch (error) {
    console.error("Delete progress error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting progress entry",
      error: error.message,
    });
  }
};

// @desc    Get progress statistics
// @route   GET /api/progress/stats
// @access  Private
exports.getProgressStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days);

    // Calculate start date (imperative: date manipulation)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    startDate.setHours(0, 0, 0, 0);

    // Fetch progress entries (imperative: async operation)
    const progressEntries = await Progress.find({
      user: req.user.id,
      date: { $gte: startDate },
    }).sort({ date: 1 });

    if (progressEntries.length === 0) {
      return sendSuccess(res, 200, {
        message: "No progress data available",
        stats: null,
      });
    }

    // Declarative: extract and filter data using functional methods
    const weights = progressEntries.map((p) => p.weight).filter((w) => w);
    const bmis = progressEntries.map((p) => p.bmi).filter((b) => b);
    const energyLevels = progressEntries
      .map((p) => p.energyLevel)
      .filter((e) => e !== undefined);

    // Declarative: calculate statistics using reduce
    const calculateStats = (values) => {
      if (values.length === 0) return null;
      return {
        current: values[values.length - 1],
        starting: values[0],
        change: values.length > 1 ? values[values.length - 1] - values[0] : 0,
        average: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    };

    // Declarative: determine trend
    const determineTrend = (values) => {
      if (values.length <= 1) return "insufficient_data";
      const first = values[0];
      const last = values[values.length - 1];
      if (last > first) return "increasing";
      if (last < first) return "decreasing";
      return "stable";
    };

    // Build stats object (declarative: functional composition)
    const stats = {
      totalEntries: progressEntries.length,
      dateRange: {
        start: progressEntries[0].date,
        end: progressEntries[progressEntries.length - 1].date,
      },
      weight: calculateStats(weights),
      bmi: calculateStats(bmis),
      energyLevel: energyLevels.length > 0
        ? {
            average: Math.round(
              (energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length) * 10
            ) / 10,
          }
        : null,
      trends: {
        weightTrend: determineTrend(weights),
        bmiTrend: determineTrend(bmis),
      },
    };

    // Response using utility (declarative)
    return sendSuccess(res, 200, stats);
  } catch (error) {
    console.error("Get progress stats error:", error);
    return sendError(res, 500, "Server error calculating progress statistics", error.message);
  }
};

// @desc    Get latest progress entry
// @route   GET /api/progress/latest
// @access  Private
exports.getLatestProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: req.user.id })
      .sort({ date: -1 })
      .limit(1);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "No progress entries found",
      });
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error("Get latest progress error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching latest progress",
      error: error.message,
    });
  }
};

