const mongoose = require("mongoose");

const MealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a meal name"],
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  mealType: {
    type: String,
    required: true,
    enum: ["breakfast", "lunch", "dinner", "snack"],
  },
  imageUrl: String,
  source: {
    type: String,
    enum: ["spoonacular", "manual", "admin", "other"],
    default: "manual",
  },

  sourceId: {
    type: String,
    index: true,
    sparse: true, // <— important: allows null values
    unique: true, // <— prevents duplicates WHEN sourceId exists
  },

  // Timing
  prepTime: Number, // minutes
  cookTime: Number, // minutes
  servings: {
    type: Number,
    default: 1,
    min: 1,
  },

  // Ingredients
  ingredients: [
    {
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      unit: {
        type: String,
        required: true,
        enum: ["g", "kg", "ml", "l", "cup", "tbsp", "tsp", "oz", "lb", "piece"],
      },
      allergens: [String],
    },
  ],

  // Instructions
  instructions: [String],

  // Nutrition (per serving)
  nutrition: {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbohydrates: { type: Number, required: true },
    fats: { type: Number, required: true },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
  },

  // Dietary Classification
  dietaryTags: [
    {
      type: String,
      enum: [
        "vegetarian",
        "vegan",
        "gluten-free",
        "dairy-free",
        "keto",
        "paleo",
        "low-carb",
        "high-protein",
        "nut-free",
      ],
    },
  ],
  allergens: [
    {
      type: String,
      enum: [
        "nuts",
        "peanuts",
        "dairy",
        "eggs",
        "gluten",
        "soy",
        "fish",
        "shellfish",
      ],
    },
  ],

  // Meal Metadata
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Virtual for total time
MealSchema.virtual("totalTime").get(function () {
  return (this.prepTime || 0) + (this.cookTime || 0);
});

MealSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Meal", MealSchema);
