const MealPlan = require("../models/MealPlan");
const User = require("../models/User");
const nutritionService = require("../services/nutritionService");
const mealSelectionService = require("../services/mealSelectionService");
const { sendSuccess, sendError, sendPaginated } = require("../utils/responseHandler");

// @desc    Generate meal plan
// @route   POST /api/meal-plans/generate
// @access  Private
exports.generateMealPlan = async (req, res) => {
  try {
    const { startDate, duration = 7 } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const targetCalories = user.dailyCalorieTarget || 2000;
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    // Calculate target nutrition using service (declarative: service call)
    const targetNutrition = nutritionService.calculateTargetNutrition(targetCalories);

    // Get available meals for each meal type using service (declarative composition)
    const [breakfastMeals, lunchMeals, dinnerMeals, snackMeals] = await Promise.all([
      mealSelectionService.selectMealsForUser(user, "breakfast", targetCalories * 0.25),
      mealSelectionService.selectMealsForUser(user, "lunch", targetCalories * 0.35),
      mealSelectionService.selectMealsForUser(user, "dinner", targetCalories * 0.35),
      mealSelectionService.selectMealsForUser(user, "snack", targetCalories * 0.05),
    ]);

    if (
      breakfastMeals.length === 0 ||
      lunchMeals.length === 0 ||
      dinnerMeals.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Not enough meals available for your dietary preferences",
      });
    }

    // Generate days
    const days = [];
    for (let i = 0; i < duration; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);

      // Randomly select meals using service (declarative: service calls)
      const breakfast = mealSelectionService.selectRandomMeal(breakfastMeals);
      const lunch = mealSelectionService.selectRandomMeal(lunchMeals);
      const dinner = mealSelectionService.selectRandomMeal(dinnerMeals);

      // Select 1-2 snacks (imperative: random count, declarative: service call)
      const numSnacks = Math.random() > 0.5 ? 1 : 2;
      const selectedSnacks = mealSelectionService.selectRandomMeals(snackMeals, numSnacks);
      const snacks = selectedSnacks.map((snack) => ({
        meal: snack._id,
        servings: 1,
        consumed: false,
      }));

      days.push({
        date,
        meals: {
          breakfast: {
            meal: breakfast._id,
            servings: 1,
            consumed: false,
          },
          lunch: {
            meal: lunch._id,
            servings: 1,
            consumed: false,
          },
          dinner: {
            meal: dinner._id,
            servings: 1,
            consumed: false,
          },
          snacks,
        },
      });
    }

    // Calculate total meals for adherence
    let totalMeals = 0;
    days.forEach((day) => {
      totalMeals += 3; // breakfast, lunch, dinner
      totalMeals += day.meals.snacks.length;
    });

    const mealPlan = await MealPlan.create({
      user: user._id,
      startDate: start,
      duration,
      days,
      targetNutrition,
      status: "active",
      generatedBy: "auto",
      adherence: {
        totalMeals,
        consumedMeals: 0,
        adherencePercentage: 0,
      },
    });

    // Populate meals in response
    const populatedPlan = await MealPlan.findById(mealPlan._id)
      .populate("days.meals.breakfast.meal")
      .populate("days.meals.lunch.meal")
      .populate("days.meals.dinner.meal")
      .populate("days.meals.snacks.meal");

    res.status(201).json({
      success: true,
      data: populatedPlan,
    });
  } catch (error) {
    console.error("Generate meal plan error:", error);
    res.status(500).json({
      success: false,
      message: "Server error generating meal plan",
      error: error.message,
    });
  }
};

// @desc    Get all meal plans for user
// @route   GET /api/meal-plans
// @access  Private
exports.getMealPlans = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const mealPlans = await MealPlan.find(query)
      .populate("days.meals.breakfast.meal")
      .populate("days.meals.lunch.meal")
      .populate("days.meals.dinner.meal")
      .populate("days.meals.snacks.meal")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await MealPlan.countDocuments(query);

    res.status(200).json({
      success: true,
      data: mealPlans,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get meal plans error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching meal plans",
      error: error.message,
    });
  }
};

// @desc    Get single meal plan
// @route   GET /api/meal-plans/:id
// @access  Private
exports.getMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOne({
      _id: req.params.id,
      user: req.user.id,
    })
      .populate("days.meals.breakfast.meal")
      .populate("days.meals.lunch.meal")
      .populate("days.meals.dinner.meal")
      .populate("days.meals.snacks.meal");

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found",
      });
    }

    res.status(200).json({
      success: true,
      data: mealPlan,
    });
  } catch (error) {
    console.error("Get meal plan error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching meal plan",
      error: error.message,
    });
  }
};

// @desc    Update meal plan
// @route   PUT /api/meal-plans/:id
// @access  Private
exports.updateMealPlan = async (req, res) => {
  try {
    let mealPlan = await MealPlan.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found",
      });
    }

    // Update allowed fields
    const { status, days, name } = req.body;

    if (status) mealPlan.status = status;
    if (name) mealPlan.name = name;
    if (days) mealPlan.days = days;

    mealPlan.updatedAt = Date.now();
    await mealPlan.save();

    const updatedPlan = await MealPlan.findById(mealPlan._id)
      .populate("days.meals.breakfast.meal")
      .populate("days.meals.lunch.meal")
      .populate("days.meals.dinner.meal")
      .populate("days.meals.snacks.meal");

    res.status(200).json({
      success: true,
      data: updatedPlan,
    });
  } catch (error) {
    console.error("Update meal plan error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating meal plan",
      error: error.message,
    });
  }
};

// @desc    Mark meal as consumed
// @route   PUT /api/meal-plans/:id/consume
// @access  Private
exports.markMealConsumed = async (req, res) => {
  try {
    const { dayIndex, mealType, snackIndex, consumed = true } = req.body;

    const mealPlan = await MealPlan.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found",
      });
    }

    if (dayIndex < 0 || dayIndex >= mealPlan.days.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid day index",
      });
    }

    const day = mealPlan.days[dayIndex];

    if (mealType === "snack") {
      if (snackIndex === undefined || snackIndex < 0 || snackIndex >= day.meals.snacks.length) {
        return res.status(400).json({
          success: false,
          message: "Invalid snack index",
        });
      }
      day.meals.snacks[snackIndex].consumed = consumed;
      day.meals.snacks[snackIndex].consumedAt = consumed ? new Date() : null;
    } else if (["breakfast", "lunch", "dinner"].includes(mealType)) {
      day.meals[mealType].consumed = consumed;
      day.meals[mealType].consumedAt = consumed ? new Date() : null;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid meal type",
      });
    }

    // Recalculate adherence
    let consumedMeals = 0;
    mealPlan.days.forEach((d) => {
      if (d.meals.breakfast.consumed) consumedMeals++;
      if (d.meals.lunch.consumed) consumedMeals++;
      if (d.meals.dinner.consumed) consumedMeals++;
      d.meals.snacks.forEach((snack) => {
        if (snack.consumed) consumedMeals++;
      });
    });

    mealPlan.adherence.consumedMeals = consumedMeals;
    mealPlan.adherence.adherencePercentage = Math.round(
      (consumedMeals / mealPlan.adherence.totalMeals) * 100
    );

    mealPlan.updatedAt = Date.now();
    await mealPlan.save();

    const updatedPlan = await MealPlan.findById(mealPlan._id)
      .populate("days.meals.breakfast.meal")
      .populate("days.meals.lunch.meal")
      .populate("days.meals.dinner.meal")
      .populate("days.meals.snacks.meal");

    res.status(200).json({
      success: true,
      data: updatedPlan,
    });
  } catch (error) {
    console.error("Mark meal consumed error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating meal consumption",
      error: error.message,
    });
  }
};

// @desc    Get current active meal plan
// @route   GET /api/meal-plans/current
// @access  Private
exports.getCurrentMealPlan = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mealPlan = await MealPlan.findOne({
      user: req.user.id,
      status: "active",
      startDate: { $lte: today },
      endDate: { $gte: today },
    })
      .populate("days.meals.breakfast.meal")
      .populate("days.meals.lunch.meal")
      .populate("days.meals.dinner.meal")
      .populate("days.meals.snacks.meal");

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "No active meal plan found",
      });
    }

    res.status(200).json({
      success: true,
      data: mealPlan,
    });
  } catch (error) {
    console.error("Get current meal plan error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching current meal plan",
      error: error.message,
    });
  }
};

// @desc    Get nutrition summary for meal plan
// @route   GET /api/meal-plans/:id/nutrition
// @access  Private
exports.getMealPlanNutrition = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("days.meals.breakfast.meal days.meals.lunch.meal days.meals.dinner.meal days.meals.snacks.meal");

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found",
      });
    }

    // Calculate daily nutrition
    const dailyNutrition = mealPlan.days.map((day) => {
      let dayTotal = {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fats: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      };

      // Collect all meals for the day (declarative: functional approach)
      const dayMeals = [
        { meal: day.meals.breakfast.meal, servings: day.meals.breakfast.servings },
        { meal: day.meals.lunch.meal, servings: day.meals.lunch.servings },
        { meal: day.meals.dinner.meal, servings: day.meals.dinner.servings },
        ...day.meals.snacks.map((snack) => ({ meal: snack.meal, servings: snack.servings })),
      ].filter((item) => item.meal); // Filter out null meals

      // Calculate total nutrition using service (declarative: service call)
      const dayNutrition = nutritionService.calculateTotalNutrition(dayMeals);
      dayTotal = dayNutrition;

      return {
        date: day.date,
        nutrition: dayTotal,
        target: mealPlan.targetNutrition,
      };
    });

    // Calculate averages using service (declarative: service call)
    const averages = nutritionService.calculateAverageNutrition(dailyNutrition);

    res.status(200).json({
      success: true,
      data: {
        dailyNutrition,
        averages,
        target: mealPlan.targetNutrition,
      },
    });
  } catch (error) {
    console.error("Get meal plan nutrition error:", error);
    res.status(500).json({
      success: false,
      message: "Server error calculating nutrition",
      error: error.message,
    });
  }
};

