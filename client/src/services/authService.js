// src/services/authService.js
import api from "./api";

export const authService = {
  register: (userData) => api.post("/auth/register", userData),

  login: (credentials) => api.post("/auth/login", credentials),

  getMe: () => api.get("/auth/me"),

  updateProfile: (data) => api.put("/auth/updatedetails", data),

  // Change password
  changePassword: (data) => api.put("/auth/updatepassword", data),

  forgotPassword: (email) => api.post("/auth/forgotpassword", { email }),

  resetPassword: (token, password) =>
    api.put(`/auth/resetpassword/${token}`, { password }),

  logout: () => api.get("/auth/logout"),
};
