const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["nutrition", "exercise", "meal", "progress", "general"],
    required: true,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    maxlength: 500,
  },
  reasoning: {
    type: String,
    maxlength: 1000,
  },
  actionSteps: [
    {
      step: { type: String, required: true },
      completed: { type: Boolean, default: false },
      completedAt: Date,
    },
  ],
  status: {
    type: String,
    enum: ["active", "dismissed", "completed", "archived"],
    default: "active",
  },
  applied: {
    type: Boolean,
    default: false,
  },
  appliedAt: Date,
  validFrom: {
    type: Date,
    default: Date.now,
  },
  validUntil: Date,
  generatedBy: {
    type: String,
    enum: ["ai", "rule-based", "manual"],
    default: "ai",
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.8,
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Recommendation", RecommendationSchema);
