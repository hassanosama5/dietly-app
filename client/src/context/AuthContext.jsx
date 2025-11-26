// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [justRegistered, setJustRegistered] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState(null);

  // Fetch user on mount if token exists
  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      const res = await authService.getMe();
      if (res.data.success && res.data.data) {
        setUser(res.data.data);
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    // Listen to manual localStorage changes (e.g., removing token in DevTools)
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ADD THIS REGISTER FUNCTION HERE:
  const register = async (userData) => {
    try {
      setError(null);
      const res = await authService.register(userData);
      if (res.data.success) {
        const { user: u, token } = res.data.data;
        localStorage.setItem("token", token);
        setUser(u);
        setJustRegistered(true);
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

  const beginRegistration = (userData) => {
    setError(null);
    setPendingRegistration(userData);
    setJustRegistered(true);
    return { success: true };
  };

  const finalizeRegistration = async (profileData) => {
    try {
      if (!pendingRegistration) {
        return { success: false };
      }
      setError(null);
      const payload = { ...pendingRegistration, ...profileData };
      const res = await authService.register(payload);
      if (res.data.success) {
        const { user: u, token } = res.data.data;
        localStorage.setItem("token", token);
        setUser(u);
        setJustRegistered(false);
        setPendingRegistration(null);
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

  // Login
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const res = await authService.login(credentials);
      if (res.data.success) {
        const { token } = res.data.data;
        localStorage.setItem("token", token);

        // Fetch full user profile
        const userRes = await authService.getMe();
        if (userRes.data.success) {
          setUser(userRes.data.data);
        }

        setLoading(false);
        return { success: true };
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const res = await authService.updateProfile(profileData);
      if (res.data.success) {
        const updated = res.data.data;
        setUser(updated);
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

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setError(null);
      setJustRegistered(false);
      setPendingRegistration(null);
      // Optional: force redirect to guest
      window.location.href = "/dashboard";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        justRegistered,
        register, // ← ADD THIS LINE
        beginRegistration,
        finalizeRegistration,
        login,
        logout,
        updateProfile,
        clearError: () => setError(null),
        clearJustRegistered: () => setJustRegistered(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
