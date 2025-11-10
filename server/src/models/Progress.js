const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
    min: 20,
    max: 500,
  },
  bmi: {
    type: Number,
    min: 10,
    max: 60,
  },
  energyLevel: {
    type: Number,
    min: 1,
    max: 5,
  },
  measurements: {
    waist: Number,
    chest: Number,
    hips: Number,
  },
  activityMinutes: {
    type: Number,
    min: 0,
    max: 1440,
    default: 0,
  },
  waterIntake: {
    type: Number, // liters
    min: 0,
    max: 20,
    default: 0,
  },
  sleepHours: {
    type: Number,
    min: 0,
    max: 24,
    default: 0,
  },
  mood: {
    type: String,
    enum: ["excellent", "good", "neutral", "low", "poor"],
  },
  notes: {
    type: String,
    maxlength: 500,
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Unique constraint for one entry per user per day
ProgressSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Progress", ProgressSchema);
