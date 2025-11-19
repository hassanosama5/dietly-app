import React, { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getMe();
        if (res.data.success && res.data.data) {
          setUser(res.data.data);
          checkProfileCompletion(res.data.data);
        } else {
          localStorage.removeItem("token");
          setUser(null);
          setIsProfileComplete(false);
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        setUser(null);
        setIsProfileComplete(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const checkProfileCompletion = (userData) => {
    if (!userData) return false;

    const requiredFields = [
      "age",
      "gender",
      "height",
      "currentWeight",
      "targetWeight",
      "healthGoal",
      "activityLevel",
    ];

    const complete = requiredFields.every(
      (field) =>
        userData[field] !== undefined &&
        userData[field] !== null &&
        userData[field] !== "" &&
        !(typeof userData[field] === "number" && isNaN(userData[field]))
    );

    setIsProfileComplete(complete);
    return complete;
  };
  // Register
  const register = async (userData) => {
    try {
      setError(null);
      const res = await authService.register(userData);
      if (res.data.success) {
        const { user: u, token } = res.data.data;
        localStorage.setItem("token", token);
        setUser(u);
        checkProfileCompletion(u);
        return { success: true };
      } else {
        setError(res.data.message || "Registration failed");
        return { success: false };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
      return { success: false };
    }
  };

  const login = async (credentials) => {
    try {
      const res = await authService.login(credentials);

      if (res.data.success) {
        const { token } = res.data.data;
        localStorage.setItem("token", token);

        // Fetch full user profile after login
        const userRes = await authService.getMe();
        if (userRes.data.success) {
          setUser(userRes.data.data);
          checkProfileCompletion(userRes.data.data);
        }
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || err.message,
      };
    }
  };
  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const res = await authService.updateProfile(profileData);
      if (res.data.success) {
        const updated = res.data.data;
        setUser(updated);
        checkProfileCompletion(updated);
        return { success: true };
      } else {
        setError(res.data.message || "Profile update failed");
        return { success: false };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Profile update failed";
      setError(msg);
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setIsProfileComplete(false);
      setError(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        isProfileComplete,
        register,
        login,
        logout,
        updateProfile,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
