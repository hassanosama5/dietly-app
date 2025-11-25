const mongoose = require("mongoose");

const MealPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    default: function () {
      return `Meal Plan - ${new Date().toLocaleDateString()}`;
    },
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    default: 7,
    min: 1,
    max: 30,
  },

  weeklyMealOptions: [
    {
      weekNumber: { type: Number, required: true },
      breakfastOptions: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Meal",
          required: true,
        },
      ],
      lunchOptions: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Meal",
          required: true,
        },
      ],
      dinnerOptions: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Meal",
          required: true,
        },
      ],
      snackOptions: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Meal",
          required: true,
        },
      ],
    },
  ],

  // Daily Structure
  days: [
    {
      date: { type: Date, required: true },
      weekNumber: { type: Number, required: true, default: 1 },
      meals: {
        breakfast: {
          meal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Meal",
            required: true,
          },
          servings: { type: Number, default: 1, min: 0.5, max: 5 },
          consumed: { type: Boolean, default: false },
          consumedAt: Date,
        },
        lunch: {
          meal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Meal",
            required: true,
          },
          servings: { type: Number, default: 1, min: 0.5, max: 5 },
          consumed: { type: Boolean, default: false },
          consumedAt: Date,
        },
        dinner: {
          meal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Meal",
            required: true,
          },
          servings: { type: Number, default: 1, min: 0.5, max: 5 },
          consumed: { type: Boolean, default: false },
          consumedAt: Date,
        },
        snacks: [
          {
            meal: { type: mongoose.Schema.Types.ObjectId, ref: "Meal" },
            servings: { type: Number, default: 1, min: 0.5, max: 5 },
            consumed: { type: Boolean, default: false },
            consumedAt: Date,
          },
        ],
      },
      notes: {
        type: String,
        maxlength: 300,
      },
      calorieSummary: {
        targetCalories: { type: Number, required: true, default: 0 },
        consumedCalories: { type: Number, default: 0 },
        lastUpdated: Date,
      },
    },
  ],

  // Targets
  targetNutrition: {
    dailyCalories: { type: Number, required: true },
    protein: Number,
    carbohydrates: Number,
    fats: Number,
  },

  // Status & Tracking
  status: {
    type: String,
    enum: ["active", "completed", "cancelled", "draft"],
    default: "active",
  },
  generatedBy: {
    type: String,
    enum: ["auto", "manual", "ai"],
    default: "auto",
  },
  stoppedAt: Date,
  adherence: {
    totalMeals: { type: Number, default: 0 },
    consumedMeals: { type: Number, default: 0 },
    adherencePercentage: { type: Number, default: 0, min: 0, max: 100 },
  },
  calorieRing: {
    targetDailyCalories: { type: Number, default: 0 },
    activeDate: Date,
    consumedCalories: { type: Number, default: 0 },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Calculate end date
MealPlanSchema.pre("save", function (next) {
  if (this.isModified("startDate") || this.isModified("duration")) {
    const endDate = new Date(this.startDate);
    endDate.setDate(endDate.getDate() + this.duration - 1);
    this.endDate = endDate;
  }
  next();
});

module.exports = mongoose.model("MealPlan", MealPlanSchema);
