const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  // Personal Details
  age: {
    type: Number,
    min: [10, "Age must be at least 10"],
    max: [120, "Age must be less than 120"],
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },

  // Physical Measurements
  height: Number, // cm
  currentWeight: Number, // kg
  targetWeight: Number, // kg

  // Health Goals
  healthGoal: {
    type: String,
    enum: ["lose", "gain", "maintain"],
    default: "maintain",
  },
  activityLevel: {
    type: String,
    enum: ["sedentary", "light", "moderate", "active", "very_active"],
    default: "moderate",
  },
  dailyCalorieTarget: Number,

  // Dietary Preferences & Restrictions
  dietaryPreferences: [
    {
      type: String,
      enum: [
        "vegetarian",
        "vegan",
        "pescatarian",
        "keto",
        "paleo",
        "low-carb",
        "high-protein",
        "gluten-free",
        "dairy-free",
      ],
    },
  ],
  allergies: [
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
        "wheat",
      ],
    },
  ],

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Password encryption
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
