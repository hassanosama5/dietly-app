// src/services/userService.js
import api from "./api";

export const userService = {
  // Get user profile - connects to YOUR userController.js getProfile()
  getProfile: () => api.get("/users/profile/me"),

  // Update profile - connects to YOUR authController.js updateProfile()
  updateProfile: (data) => api.put("/users/profile/update", data),

  // Update user profile - connects to YOUR authController.js updateProfile()
  updateProfile: (data) => api.put("/users/profile/update", data),

  // Calculate nutrition - connects to YOUR userController.js calculateNutrition()
  calculateNutrition: () => api.get("/users/profile/nutrition"),

  // Get user stats - connects to YOUR userController.js getUserProfileStats()
  getUserStats: () => api.get("/users/profile/stats"),
};