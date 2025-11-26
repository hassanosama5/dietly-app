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
    return sendError(res, 500, "Server error fetching latest progress", error.message);
  }
};

// @desc    Get progress trends over time
// @route   GET /api/v1/progress/trends
// @access  Private
exports.getProgressTrends = async (req, res) => {
  try {
    // This can use the same stats endpoint or provide more detailed trend analysis
    const { days = 30 } = req.query;
    req.query.days = days;
    return exports.getProgressStats(req, res);
  } catch (error) {
    console.error("Get progress trends error:", error);
    return sendError(res, 500, "Server error fetching progress trends", error.message);
  }
};

// @desc    Add progress photos
// @route   POST /api/v1/progress/:id/photos
// @access  Private
exports.addProgressPhotos = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!progress) {
      return sendError(res, 404, "Progress entry not found");
    }

    // TODO: Implement photo upload functionality
    // For now, return not implemented
    // In production, you would:
    // 1. Handle file upload (using multer or similar)
    // 2. Store photos (local storage or cloud storage)
    // 3. Save photo URLs to progress entry
    // 4. Return updated progress entry

    return sendError(res, 501, "Progress photo upload not implemented yet");
  } catch (error) {
    console.error("Add progress photos error:", error);
    return sendError(res, 500, "Server error adding progress photos", error.message);
  }
};

// @desc    Get weigh-in status (Sunday-based tracking)
// @route   GET /api/v1/progress/weigh-in-status
// @access  Private
exports.getWeighInStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Get the last weigh-in
    const lastWeighIn = await Progress.findOne({ user: req.user.id })
      .sort({ date: -1 })
      .limit(1);

    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday

    // Calculate days until next Sunday
    const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;

    // Calculate next Sunday date
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    nextSunday.setHours(0, 0, 0, 0);

    // Check if user can weigh-in
    let canWeighIn = false;
    let message = "";

    if (currentDay === 0) {
      // It's Sunday
      if (!lastWeighIn) {
        canWeighIn = true;
        message = "Welcome! Log your first weight entry.";
      } else {
        // Check if last weigh-in was before this Sunday
        const thisSunday = new Date(today);
        thisSunday.setHours(0, 0, 0, 0);

        if (lastWeighIn.date < thisSunday) {
          canWeighIn = true;
          message = "It's Sunday! Time for your weekly weigh-in.";
        } else {
          canWeighIn = false;
          message = "You've already weighed in this week. Next weigh-in is next Sunday.";
        }
      }
    } else {
      canWeighIn = false;
      message = `Next weigh-in is on ${nextSunday.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`;
    }

    const status = {
      canWeighIn,
      isSunday: currentDay === 0,
      daysUntilNextWeighIn: daysUntilSunday,
      nextWeighInDate: nextSunday,
      lastWeighInDate: lastWeighIn ? lastWeighIn.date : null,
      lastWeight: lastWeighIn ? lastWeighIn.weight : null,
      message,
    };

    return sendSuccess(res, 200, status);
  } catch (error) {
    console.error("Get weigh-in status error:", error);
    return sendError(res, 500, "Server error checking weigh-in status", error.message);
  }
};

// @desc    Get goal progress with hybrid projections
// @route   GET /api/v1/progress/goal-progress
// @access  Private
exports.getGoalProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Check if user has target weight set
    if (!user.targetWeight) {
      return sendSuccess(res, 200, {
        hasGoal: false,
        message: "No target weight set. Please update your profile to set a goal.",
      });
    }

    // Get all progress entries
    const progressEntries = await Progress.find({ user: req.user.id })
      .sort({ date: 1 })
      .select("date weight");

    if (progressEntries.length === 0) {
      return sendSuccess(res, 200, {
        hasGoal: true,
        hasData: false,
        message: "No progress data yet. Log your first weight entry!",
        goal: {
          startWeight: user.currentWeight,
          currentWeight: user.currentWeight,
          targetWeight: user.targetWeight,
          healthGoal: user.healthGoal,
        },
      });
    }

    const startWeight = progressEntries[0].weight;
    const currentWeight = user.currentWeight || progressEntries[progressEntries.length - 1].weight;
    const targetWeight = user.targetWeight;
    const healthGoal = user.healthGoal; // 'lose', 'gain', 'maintain'

    // Calculate basic progress
    const totalChange = currentWeight - startWeight;
    const targetChange = targetWeight - startWeight;
    const remainingChange = targetWeight - currentWeight;

    // Progress percentage (handle division by zero)
    const progressPercentage = targetChange !== 0
      ? Math.max(0, Math.min(100, ((currentWeight - startWeight) / targetChange) * 100))
      : 0;

    // Calculate weekly changes (only use entries that are at least 7 days apart)
    const weeklyChanges = [];
    for (let i = 1; i < progressEntries.length; i++) {
      const prevEntry = progressEntries[i - 1];
      const currEntry = progressEntries[i];
      const daysDiff = Math.round((currEntry.date - prevEntry.date) / (1000 * 60 * 60 * 24));

      if (daysDiff >= 7) {
        const weeksDiff = daysDiff / 7;
        const weightChange = currEntry.weight - prevEntry.weight;
        const weeklyRate = weightChange / weeksDiff;
        weeklyChanges.push(weeklyRate);
      }
    }

    // Calculate average weekly change
    const avgWeeklyChange = weeklyChanges.length > 0
      ? weeklyChanges.reduce((sum, change) => sum + change, 0) / weeklyChanges.length
      : 0;

    // HYBRID PROJECTION SCENARIOS
    const projections = {
      optimistic: null,
      realistic: null,
      conservative: null,
    };

    // Only calculate projections if making progress toward goal
    const isProgressingTowardGoal =
      (healthGoal === 'lose' && avgWeeklyChange < 0) ||
      (healthGoal === 'gain' && avgWeeklyChange > 0);

    if (isProgressingTowardGoal && Math.abs(avgWeeklyChange) > 0.05) {
      // Optimistic: Based on best 3 weekly changes
      const sortedChanges = [...weeklyChanges].sort((a, b) => {
        if (healthGoal === 'lose') return a - b; // Most negative (most loss)
        return b - a; // Most positive (most gain)
      });
      const bestChanges = sortedChanges.slice(0, Math.min(3, sortedChanges.length));
      const optimisticRate = bestChanges.length > 0
        ? bestChanges.reduce((sum, c) => sum + c, 0) / bestChanges.length
        : avgWeeklyChange;

      const optimisticWeeks = Math.abs(remainingChange / optimisticRate);
      const optimisticDate = new Date();
      optimisticDate.setDate(optimisticDate.getDate() + Math.ceil(optimisticWeeks * 7));

      projections.optimistic = {
        weeksToGoal: Math.round(optimisticWeeks * 10) / 10,
        estimatedDate: optimisticDate,
        weeklyRate: Math.round(optimisticRate * 100) / 100,
        description: "Based on your best weekly changes",
      };

      // Realistic: Based on average weekly change
      const realisticWeeks = Math.abs(remainingChange / avgWeeklyChange);
      const realisticDate = new Date();
      realisticDate.setDate(realisticDate.getDate() + Math.ceil(realisticWeeks * 7));

      projections.realistic = {
        weeksToGoal: Math.round(realisticWeeks * 10) / 10,
        estimatedDate: realisticDate,
        weeklyRate: Math.round(avgWeeklyChange * 100) / 100,
        description: "Based on your average rate of progress",
      };

      // Conservative: Reduce average rate by 30% (accounts for plateaus)
      const conservativeRate = avgWeeklyChange * 0.7;
      const conservativeWeeks = Math.abs(remainingChange / conservativeRate);
      const conservativeDate = new Date();
      conservativeDate.setDate(conservativeDate.getDate() + Math.ceil(conservativeWeeks * 7));

      projections.conservative = {
        weeksToGoal: Math.round(conservativeWeeks * 10) / 10,
        estimatedDate: conservativeDate,
        weeklyRate: Math.round(conservativeRate * 100) / 100,
        description: "Conservative estimate accounting for potential plateaus",
      };
    }

    const goalProgress = {
      hasGoal: true,
      hasData: true,
      goal: {
        startWeight,
        currentWeight,
        targetWeight,
        healthGoal,
      },
      progress: {
        totalChange: Math.round(totalChange * 100) / 100,
        remainingChange: Math.round(remainingChange * 100) / 100,
        progressPercentage: Math.round(progressPercentage * 10) / 10,
        avgWeeklyChange: Math.round(avgWeeklyChange * 100) / 100,
        totalWeeks: progressEntries.length,
      },
      projections,
      insights: {
        isOnTrack: isProgressingTowardGoal,
        message: isProgressingTowardGoal
          ? `You're making progress! Keep it up!`
          : progressEntries.length < 3
          ? "Keep logging your weight to see projections."
          : `Progress seems slow. Consider reviewing your meal plan adherence or adjusting your goals.`,
      },
    };

    return sendSuccess(res, 200, goalProgress);
  } catch (error) {
    console.error("Get goal progress error:", error);
    return sendError(res, 500, "Server error calculating goal progress", error.message);
  }
};

// @desc    Get correlation between adherence and weight progress
// @route   GET /api/v1/progress/correlations
// @access  Private
exports.getCorrelations = async (req, res) => {
  try {
    const MealPlan = require("../models/MealPlan");
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Get all completed or active meal plans
    const mealPlans = await MealPlan.find({
      user: req.user.id,
      status: { $in: ['completed', 'active'] },
    }).sort({ startDate: 1 });

    // Get all progress entries
    const progressEntries = await Progress.find({ user: req.user.id })
      .sort({ date: 1 });

    if (mealPlans.length === 0 || progressEntries.length < 2) {
      return sendSuccess(res, 200, {
        hasData: false,
        message: "Insufficient data for correlation analysis. Complete at least one meal plan and log multiple weight entries.",
      });
    }

    // Analyze weekly adherence vs weight change
    const weeklyData = [];

    mealPlans.forEach(plan => {
      const planStartDate = new Date(plan.startDate);
      const planEndDate = new Date(plan.endDate);

      // Get weight at start of plan
      const startWeight = progressEntries.find(p => {
        const pDate = new Date(p.date);
        return pDate >= planStartDate;
      });

      // Get weight at end of plan (or closest after)
      const endWeight = progressEntries.find(p => {
        const pDate = new Date(p.date);
        return pDate >= planEndDate;
      });

      if (startWeight && endWeight) {
        const weightChange = endWeight.weight - startWeight.weight;
        const adherencePercentage = plan.adherence.adherencePercentage || 0;

        weeklyData.push({
          planName: plan.name,
          adherence: adherencePercentage,
          weightChange: Math.round(weightChange * 100) / 100,
          startDate: planStartDate,
          endDate: planEndDate,
        });
      }
    });

    if (weeklyData.length === 0) {
      return sendSuccess(res, 200, {
        hasData: false,
        message: "Unable to correlate data. Ensure you have weight entries at the start and end of meal plans.",
      });
    }

    // Group by adherence level
    const highAdherence = weeklyData.filter(d => d.adherence >= 85);
    const mediumAdherence = weeklyData.filter(d => d.adherence >= 70 && d.adherence < 85);
    const lowAdherence = weeklyData.filter(d => d.adherence < 70);

    const calculateAvgWeightChange = (data) => {
      if (data.length === 0) return 0;
      const sum = data.reduce((acc, d) => acc + d.weightChange, 0);
      return Math.round((sum / data.length) * 100) / 100;
    };

    const insights = {
      highAdherence: {
        count: highAdherence.length,
        avgWeightChange: calculateAvgWeightChange(highAdherence),
        label: "High Adherence (85%+)",
      },
      mediumAdherence: {
        count: mediumAdherence.length,
        avgWeightChange: calculateAvgWeightChange(mediumAdherence),
        label: "Medium Adherence (70-84%)",
      },
      lowAdherence: {
        count: lowAdherence.length,
        avgWeightChange: calculateAvgWeightChange(lowAdherence),
        label: "Low Adherence (<70%)",
      },
    };

    // Generate insight message
    let message = "";
    const healthGoal = user.healthGoal;

    if (highAdherence.length > 0 && lowAdherence.length > 0) {
      const diff = Math.abs(insights.highAdherence.avgWeightChange - insights.lowAdherence.avgWeightChange);

      if (healthGoal === 'lose') {
        message = `Weeks with 85%+ adherence resulted in ${Math.abs(insights.highAdherence.avgWeightChange)}kg average loss, `;
        message += `compared to ${Math.abs(insights.lowAdherence.avgWeightChange)}kg with low adherence. `;
        message += `High adherence makes a ${diff.toFixed(1)}kg difference!`;
      } else if (healthGoal === 'gain') {
        message = `Weeks with 85%+ adherence resulted in ${Math.abs(insights.highAdherence.avgWeightChange)}kg average gain, `;
        message += `compared to ${Math.abs(insights.lowAdherence.avgWeightChange)}kg with low adherence. `;
        message += `High adherence makes a ${diff.toFixed(1)}kg difference!`;
      }
    } else {
      message = "Keep tracking to build more correlation insights!";
    }

    const correlations = {
      hasData: true,
      weeklyData,
      insights,
      summary: {
        totalPlans: weeklyData.length,
        avgAdherence: Math.round(weeklyData.reduce((sum, d) => sum + d.adherence, 0) / weeklyData.length),
        avgWeightChange: calculateAvgWeightChange(weeklyData),
        message,
      },
    };

    return sendSuccess(res, 200, correlations);
  } catch (error) {
    console.error("Get correlations error:", error);
    return sendError(res, 500, "Server error calculating correlations", error.message);
  }
};

