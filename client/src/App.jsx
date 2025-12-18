import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MealProvider } from "./context/MealContext";
import { Menu, X } from "lucide-react";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DashboardUser from "./pages/DashboardUser";
import DashboardGuest from "./pages/DashboardGuest";
import ProfileSetup from "./pages/profile/ProfileSetup";
import Profile from "./pages/profile/Profile";
import Settings from "./pages/Settings";
import ChangePassword from "./pages/ChangePassword";
import Meals from "./pages/Meals";
import MealDetailPage from "./pages/MealDetailPage";
import Progress from "./pages/Progress";
import MealPlans from "./pages/MealPlans";
import MealPlanView from "./components/meal-plans/MealPlanView";
import Chatbot from "./pages/Chatbot";
import LoadingSpinner from "./components/common/LoadingSpinner";
import DashboardLayout from "./components/layouts/DashboardLayout";

// Admin pages - ADD THESE IMPORTS
import DashboardAdmin from "./pages/DashboardAdmin";
import ManageUsers from "./pages/ManageUsers";
import ManageMeals from "./pages/ManageMeals";

// Route for logged-in users - UPDATED WITH ROLE CHECKS
const ProtectedRoute = ({
  children,
  allowJustRegistered = false,
  adminOnly = false,
  userOnly = false,
}) => {
  const { isAuthenticated, loading, justRegistered, user } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    if (allowJustRegistered && justRegistered) return children;
    return <Navigate to="/" replace />;
  }

  // If this is the profile-setup route and allowJustRegistered is true, always allow access
  if (allowJustRegistered) {
    return children;
  }

  // Only redirect to profile-setup if user just registered AND this is NOT the profile-setup route
  if (justRegistered && window.location.pathname !== "/profile-setup") {
    return <Navigate to="/profile-setup" replace />;
  }

  // ROLE-BASED ACCESS CONTROL
  // Admin-only routes - redirect regular users to their dashboard
  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/user-dashboard" replace />;
  }

  // User-only routes - redirect admins to admin dashboard
  if (userOnly && user?.role === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
};
// Route for guests - KEEP YOUR EXISTING VERSION BUT ADD ROLE CHECK
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading, justRegistered, user } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (isAuthenticated) {
    if (justRegistered) return <Navigate to="/profile-setup" replace />;

    // ADD ROLE-BASED REDIRECTION
    if (user?.role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/user-dashboard" replace />;
  }

  return children;
};

// Public route - accessible to both guests and logged-in users - KEEP YOUR EXISTING
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, justRegistered } = useAuth();

  if (loading) return <LoadingSpinner />;

  // If user is authenticated and just registered, redirect to profile setup
  if (isAuthenticated && justRegistered) {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
};

// Scroll to top on route change
const ScrollToTop = () => {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
};

// Guest Layout component with navbar - now mobile-friendly
const GuestLayout = ({ children }) => {
  const [scrolled, setScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = (path) => {
    window.location.href = path;
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#246608]/95 backdrop-blur-xl border-b border-white/[0.05]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div
              className="flex items-center space-x-4 cursor-pointer"
              onClick={() => handleNavigate("/dashboard")}
            >
              <img
                src={scrolled ? "/logo-white.png" : "/logo-green.png"}
                alt="Logo"
                className="w-20 h-20 md:w-24 md:h-24"
              />
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => handleNavigate("/meals")}
                className={`
                  text-base font-medium transition-colors duration-300
                  ${
                    scrolled
                      ? "text-white hover:text-yellow-200 hover:bg-white/5"
                      : "text-black hover:text-gray-600 hover:bg-gray-100"
                  }
                  font-poppins px-4 py-2 rounded-lg
                `}
              >
                Browse Meals
              </button>
              <button
                onClick={() => handleNavigate("/login")}
                className={`
                  text-base font-medium transition-colors duration-300
                  ${
                    scrolled
                      ? "text-white hover:text-yellow-200 hover:bg-white/5"
                      : "text-black hover:text-gray-600 hover:bg-gray-100"
                  }
                  font-poppins px-4 py-2 rounded-lg
                `}
              >
                Login
              </button>
              <button
                onClick={() => handleNavigate("/register")}
                className={`
                  text-base font-medium transition-colors duration-300
                  ${
                    scrolled
                      ? "text-white hover:text-yellow-200 hover:bg-white/5"
                      : "text-black hover:text-gray-600 hover:bg-gray-100"
                  }
                  font-poppins px-4 py-2 rounded-lg
                `}
              >
                Register
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className={`inline-flex items-center justify-center rounded-full border border-white/20 p-2 ${
                  scrolled
                    ? "text-white hover:bg-white/10"
                    : "text-black hover:bg-gray-100"
                }`}
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Panel */}
        {isMobileMenuOpen && (
          <div
            className={`md:hidden border-t ${
              scrolled
                ? "bg-[#246608]/95 border-white/10"
                : "bg-white/95 border-gray-200 shadow-lg"
            }`}
          >
            <div className="max-w-[1200px] mx-auto px-4 pt-3 pb-4 space-y-2">
              <button
                onClick={() => handleNavigate("/meals")}
                className={`w-full text-left text-base font-medium font-poppins rounded-lg px-4 py-2.5 transition-colors ${
                  scrolled
                    ? "text-white hover:text-yellow-200 hover:bg-white/10"
                    : "text-gray-900 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Browse Meals
              </button>
              <button
                onClick={() => handleNavigate("/login")}
                className={`w-full text-left text-base font-medium font-poppins rounded-lg px-4 py-2.5 transition-colors ${
                  scrolled
                    ? "text-white hover:text-yellow-200 hover:bg-white/10"
                    : "text-gray-900 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => handleNavigate("/register")}
                className={`w-full text-left text-base font-medium font-poppins rounded-lg px-4 py-2.5 transition-colors ${
                  scrolled
                    ? "text-white hover:text-yellow-200 hover:bg-white/10"
                    : "text-gray-900 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Register
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="pt-20">
        {" "}
        {/* Add padding to account for fixed navbar */}
        {children}
      </div>
    </div>
  );
};

// Component to conditionally wrap meals in appropriate layout - KEEP YOUR EXISTING
const MealsRoute = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <DashboardLayout>
      <Meals />
    </DashboardLayout>
  ) : (
    <GuestLayout>
      <Meals />
    </GuestLayout>
  );
};

// Component to conditionally wrap meal detail in appropriate layout - KEEP YOUR EXISTING
const MealDetailRoute = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <DashboardLayout>
      <MealDetailPage />
    </DashboardLayout>
  ) : (
    <GuestLayout>
      <MealDetailPage />
    </GuestLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <MealProvider>
        <Router>
          <ScrollToTop />
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

            {/* Profile Setup - Allow both users and admins */}
            <Route
              path="/profile-setup"
              element={
                <ProtectedRoute allowJustRegistered={true}>
                  <ProfileSetup />
                </ProtectedRoute>
              }
            />

            {/* Profile Page - Allow both users and admins */}
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

            {/* Settings Page - Allow both users and admins */}
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

            {/* Change Password Page - Allow both users and admins */}
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ChangePassword />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* ========== USER-ONLY ROUTES ========== */}
            {/* Chatbot Page - USER ONLY (Redirect admins) */}
            <Route
              path="/chatbot"
              element={
                <ProtectedRoute userOnly={true}>
                  <DashboardLayout>
                    <Chatbot />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* User Dashboard - USER ONLY */}
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute userOnly={true}>
                  <DashboardUser />
                </ProtectedRoute>
              }
            />

            {/* Progress - USER ONLY */}
            <Route
              path="/progress"
              element={
                <ProtectedRoute userOnly={true}>
                  <DashboardLayout>
                    <Progress />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Meal Plans - USER ONLY */}
            <Route
              path="/meal-plans"
              element={
                <ProtectedRoute userOnly={true}>
                  <DashboardLayout>
                    <MealPlans />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/meal-plans/view/:id"
              element={
                <ProtectedRoute userOnly={true}>
                  <DashboardLayout>
                    <MealPlanView />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* ========== ADMIN-ONLY ROUTES ========== */}
            {/* ADMIN Dashboard - ADMIN ONLY */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute adminOnly={true}>
                  <DashboardAdmin />
                </ProtectedRoute>
              }
            />

            {/* ADMIN ROUTES - ADMIN ONLY */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly={true}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/meals"
              element={
                <ProtectedRoute adminOnly={true}>
                  <ManageMeals />
                </ProtectedRoute>
              }
            />

            {/* ========== PUBLIC/NEUTRAL ROUTES ========== */}
            {/* Guest Dashboard */}
            <Route
              path="/dashboard"
              element={
                <GuestRoute>
                  <DashboardGuest />
                </GuestRoute>
              }
            />

            {/* Public Meal Pages - Accessible to both guests and logged-in users */}
            <Route
              path="/meals"
              element={
                <PublicRoute>
                  <MealsRoute />
                </PublicRoute>
              }
            />
            <Route
              path="/meals/:id"
              element={
                <PublicRoute>
                  <MealDetailRoute />
                </PublicRoute>
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
