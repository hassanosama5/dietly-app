const Meal = require("../models/Meal");
const { sendSuccess, sendError, sendPaginated } = require("../utils/responseHandler");
const { sanitizeArray } = require("../utils/validationHelper");

// @desc    Get all meals (with filters)
// @route   GET /api/meals
// @access  Public
exports.getMeals = async (req, res) => {
  try {
    const {
      mealType,
      dietaryTags,
      allergens,
      difficulty,
      minCalories,
      maxCalories,
      minProtein,
      search,
      page = 1,
      limit = 500,
    } = req.query;

    // Build query (declarative: functional composition)
    const query = { isActive: true };

    // Declarative: conditional assignment using logical operators
    if (mealType) query.mealType = mealType;
    if (difficulty) query.difficulty = difficulty;

    // Declarative: array sanitization and filtering
    if (dietaryTags) {
      query.dietaryTags = { $in: sanitizeArray(dietaryTags) };
    }

    if (allergens) {
      query.allergens = { $nin: sanitizeArray(allergens) };
    }

    // Imperative: build nested query object
    if (minCalories || maxCalories) {
      query["nutrition.calories"] = {};
      if (minCalories) query["nutrition.calories"].$gte = Number(minCalories);
      if (maxCalories) query["nutrition.calories"].$lte = Number(maxCalories);
    }

    if (minProtein) {
      query["nutrition.protein"] = { $gte: Number(minProtein) };
    }

    // Declarative: search using array methods
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination (imperative: calculations)
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Database operations (imperative: async)
    const meals = await Meal.find(query)
      .sort({ averageRating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Meal.countDocuments(query);

    // Response using utility (declarative)
    return sendPaginated(res, meals, {
      page: pageNum,
      limit: limitNum,
      total,
    });
  } catch (error) {
    console.error("Get meals error:", error);
    return sendError(res, 500, "Server error fetching meals", error.message);
  }
};

// @desc    Get single meal by ID
// @route   GET /api/meals/:id
// @access  Public
exports.getMeal = async (req, res) => {
  try {
    // Find meal (imperative: async operation)
    const meal = await Meal.findById(req.params.id);

    // Validation (imperative: conditional checks)
    if (!meal || !meal.isActive) {
      return sendError(res, 404, "Meal not found");
    }

    // Response using utility (declarative)
    return sendSuccess(res, 200, meal);
  } catch (error) {
    console.error("Get meal error:", error);
    return sendError(res, 500, "Server error fetching meal", error.message);
  }
};

// @desc    Create new meal (Admin only)
// @route   POST /api/meals
// @access  Private/Admin
exports.createMeal = async (req, res) => {
  try {
    const mealData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const meal = await Meal.create(mealData);

    res.status(201).json({
      success: true,
      data: meal,
    });
  } catch (error) {
    console.error("Create meal error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating meal",
      error: error.message,
    });
  }
};

// @desc    Update meal (Admin only)
// @route   PUT /api/meals/:id
// @access  Private/Admin
exports.updateMeal = async (req, res) => {
  try {
    let meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: "Meal not found",
      });
    }

    // Update meal
    meal = await Meal.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: meal,
    });
  } catch (error) {
    console.error("Update meal error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating meal",
      error: error.message,
    });
  }
};

// @desc    Delete meal (Admin only)
// @route   DELETE /api/meals/:id
// @access  Private/Admin
exports.deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: "Meal not found",
      });
    }

    // Soft delete by setting isActive to false
    meal.isActive = false;
    meal.updatedAt = Date.now();
    await meal.save();

    res.status(200).json({
      success: true,
      message: "Meal deleted successfully",
    });
  } catch (error) {
    console.error("Delete meal error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting meal",
      error: error.message,
    });
  }
};

// @desc    Get meals by meal type
// @route   GET /api/meals/type/:mealType
// @access  Public
exports.getMealsByType = async (req, res) => {
  try {
    const { mealType } = req.params;
    const { allergens, dietaryTags } = req.query;

    const query = {
      mealType,
      isActive: true,
    };

    if (allergens) {
      const allergenList = Array.isArray(allergens) ? allergens : [allergens];
      query.allergens = { $nin: allergenList };
    }

    if (dietaryTags) {
      const tags = Array.isArray(dietaryTags) ? dietaryTags : [dietaryTags];
      query.dietaryTags = { $in: tags };
    }

    const meals = await Meal.find(query).sort({ averageRating: -1 });

    res.status(200).json({
      success: true,
      data: meals,
      count: meals.length,
    });
  } catch (error) {
    console.error("Get meals by type error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching meals",
      error: error.message,
    });
  }
};

// @desc    Get filtered meals for user preferences
// @route   GET /api/meals/filtered
// @access  Private
exports.getFilteredMeals = async (req, res) => {
  try {
    const user = req.user;
    const { mealType, minCalories, maxCalories } = req.query;

    const query = { isActive: true };

    if (mealType) {
      query.mealType = mealType;
    }

    // Filter by dietary preferences
    if (user.dietaryPreferences && user.dietaryPreferences.length > 0) {
      query.dietaryTags = { $in: user.dietaryPreferences };
    }

    // Exclude allergens
    if (user.allergies && user.allergies.length > 0) {
      query.allergens = { $nin: user.allergies };
    }

    // Filter by calorie range
    if (minCalories || maxCalories) {
      query["nutrition.calories"] = {};
      if (minCalories) query["nutrition.calories"].$gte = Number(minCalories);
      if (maxCalories) query["nutrition.calories"].$lte = Number(maxCalories);
    }

    const meals = await Meal.find(query).sort({ averageRating: -1 });

    res.status(200).json({
      success: true,
      data: meals,
      count: meals.length,
    });
  } catch (error) {
    console.error("Get filtered meals error:", error);
    return sendError(res, 500, "Server error fetching filtered meals", error.message);
  }
};

// @desc    Get meal suggestions for user
// @route   GET /api/v1/meals/suggestions
// @access  Private
exports.getMealSuggestions = async (req, res) => {
  try {
    // This is essentially the same as getFilteredMeals but can be customized
    // for suggestions (e.g., based on meal plan, time of day, etc.)
    return exports.getFilteredMeals(req, res);
  } catch (error) {
    console.error("Get meal suggestions error:", error);
    return sendError(res, 500, "Server error fetching meal suggestions", error.message);
  }
};

