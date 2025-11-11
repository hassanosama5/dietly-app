const express = require("express");
const cors = require("cors");
const app = express();

// Import route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const mealRoutes = require('./routes/mealRoutes');
const mealPlanRoutes = require('./routes/mealPlanRoutes');
const progressRoutes = require('./routes/progressRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

app.use(cors());
app.use(express.json());

// Sample route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/meals', mealRoutes);
app.use('/api/v1/meal-plans', mealPlanRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);

module.exports = app;
