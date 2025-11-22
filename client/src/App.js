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
import Dashboard from "./pages/Dashboard";
import ProfileSetup from "./pages/profile/ProfileSetup";
import Meals from "./pages/Meals";
import MealDetailPage from "./pages/MealDetailPage";
import Progress from "./pages/Progress";
import MealPlans from "./pages/MealPlans";
import MealPlanView from "./components/meal-plans/MealPlanView";
import LoadingSpinner from "./components/common/LoadingSpinner";

const ProtectedRoute = ({ children, allowIncompleteProfile = false }) => {
  const { isAuthenticated, loading, isProfileComplete } = useAuth();

  if (loading || isProfileComplete === null) return <LoadingSpinner />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!allowIncompleteProfile && !isProfileComplete) {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <MealProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile-setup"
                element={
                  <ProtectedRoute allowIncompleteProfile={true}>
                    <ProfileSetup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meals"
                element={
                  <ProtectedRoute>
                    <Meals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meals/:id"
                element={
                  <ProtectedRoute>
                    <MealDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/progress"
                element={
                  <ProtectedRoute>
                    <Progress />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meal-plans"
                element={
                  <ProtectedRoute>
                    <MealPlans />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meal-plans/view/:id"
                element={
                  <ProtectedRoute>
                    <MealPlanView />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="*"
                element={
                  <div className="text-center text-2xl py-20">
                    404 - Page Not Found
                  </div>
                }
              />
            </Routes>
          </div>
        </Router>
      </MealProvider>
    </AuthProvider>
  );
}

export default App;
