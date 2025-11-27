import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MealProvider } from "./context/MealContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DashboardUser from "./pages/DashboardUser";
import DashboardGuest from "./pages/DashboardGuest";
import ProfileSetup from "./pages/profile/ProfileSetup";
import Profile from "./pages/profile/Profile";
import Settings from "./pages/Settings";
import Meals from "./pages/Meals";
import MealDetailPage from "./pages/MealDetailPage";
import Progress from "./pages/Progress";
import MealPlans from "./pages/MealPlans";
import MealPlanView from "./components/meal-plans/MealPlanView";
import LoadingSpinner from "./components/common/LoadingSpinner";
import DashboardLayout from "./components/layouts/DashboardLayout";

// 🔥 Correct import for your admin dashboard page
import DashboardAdmin from "./pages/DashboardAdmin";
import ManageUsers from "./pages/ManageUsers";
import ManageMeals from "./pages/ManageMeals";   // ✅ ADDED

// Route for logged-in users
const ProtectedRoute = ({ children, allowIncompleteProfile = false }) => {
  const { isAuthenticated, loading, isProfileComplete, user } = useAuth();

  if (loading || isProfileComplete === null) return <LoadingSpinner />;

  if (!isAuthenticated) return <Navigate to="/" replace />;

  // 🔥 Admins bypass profile completeness requirement
  if (user?.role === "admin") {
    return children;
  }

  // Normal user must complete profile
  if (!allowIncompleteProfile && !isProfileComplete) {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
};


// Route for guests
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (isAuthenticated) return <Navigate to="/user-dashboard" replace />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <MealProvider>
        <Router>
          <Routes>
            {/* Auth pages */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />

            {/* Profile Setup */}
            <Route
              path="/profile-setup"
              element={
                <ProtectedRoute allowIncompleteProfile={true}>
                  <ProfileSetup />
                </ProtectedRoute>
              }
            />

            {/* Profile Page */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Profile />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Settings Page */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Settings />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Guest Dashboard */}
            <Route
              path="/dashboard"
              element={
                <GuestRoute>
                  <DashboardGuest />
                </GuestRoute>
              }
            />

            {/* Logged-in Dashboard User */}
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute>
                  <DashboardUser />
                </ProtectedRoute>
              }
            />

            {/* 🔥 NEW ADMIN DASHBOARD ROUTE */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute>
                  <DashboardAdmin />
                </ProtectedRoute>
              }
            />

            {/* 🔥 ADMIN MANAGE USERS ROUTE */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />

            {/* 🔥 ADMIN MANAGE MEALS ROUTE — ADDED */}
            <Route
              path="/admin/meals"
              element={
                <ProtectedRoute>
                  <ManageMeals />
                </ProtectedRoute>
              }
            />

            {/* Other protected pages */}
            <Route
              path="/meals"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Meals />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meals/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MealDetailPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Progress />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meal-plans"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MealPlans />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meal-plans/view/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MealPlanView />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Redirect root */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="text-center text-2xl py-20">
                  404 - Page Not Found
                </div>
              }
            />
          </Routes>
        </Router>
      </MealProvider>
    </AuthProvider>
  );
}

export default App;
