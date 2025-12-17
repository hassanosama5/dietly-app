// client/src/components/layout/DashboardLayout.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { User, Settings, LogOut, MessageCircle, Menu, X } from "lucide-react";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMenus = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    closeMenus();
  };

  const handleLogout = () => {
    logout();
    navigate("/dashboard");
    closeMenus();
  };

  const handleProfileClick = () => {
    navigate("/profile");
    closeMenus();
  };

  const handleSettingsClick = () => {
    navigate("/settings");
    closeMenus();
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* ==================== NAVIGATION ==================== */}
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
            <div className="flex items-center space-x-4">
              <img
                src={scrolled ? "/logo-white.png" : "/logo-green.png"}
                alt="Logo"
                className="w-20 h-20 md:w-24 md:h-24 cursor-pointer"
                onClick={() => handleNavigate("/dashboard")}
              />
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                onClick={() => handleNavigate("/meals")}
                variant="ghost"
                size="sm"
                className={`
                  text-base font-medium transition-colors duration-300
                  ${
                    scrolled
                      ? "text-white hover:text-yellow-200 hover:bg-white/5"
                      : "text-black hover:text-gray-600 hover:bg-gray-100"
                  }
                  font-poppins
                `}
              >
                Browse Meals
              </Button>

              <Button
                onClick={() => handleNavigate("/progress")}
                variant="ghost"
                size="sm"
                className={`
                  text-base font-medium transition-colors duration-300
                  ${
                    scrolled
                      ? "text-white hover:text-yellow-200 hover:bg-white/5"
                      : "text-black hover:text-gray-600 hover:bg-gray-100"
                  }
                  font-poppins
                `}
              >
                Progress
              </Button>

              <Button
                onClick={() => handleNavigate("/meal-plans")}
                variant="ghost"
                size="sm"
                className={`
                  text-base font-medium transition-colors duration-300
                  ${
                    scrolled
                      ? "text-white hover:text-yellow-200 hover:bg-white/5"
                      : "text-black hover:text-gray-600 hover:bg-gray-100"
                  }
                  font-poppins
                `}
              >
                My Plans
              </Button>

              <Button
                onClick={() => handleNavigate("/chatbot")}
                variant="ghost"
                size="sm"
                className={`
                  text-base font-medium transition-colors duration-300
                  ${
                    scrolled
                      ? "text-white hover:text-yellow-200 hover:bg-white/5"
                      : "text-black hover:text-gray-600 hover:bg-gray-100"
                  }
                  font-poppins flex items-center space-x-1
                `}
              >
                <MessageCircle className="w-4 h-4" />
                <span>AI Coach</span>
              </Button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <Button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 rounded-full p-0 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-[#246608] transition-all"
                >
                  <img
                    src="/default-profile.svg"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </Button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 font-poppins">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleProfileClick}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-[#246608]/10 flex items-center space-x-3 transition-colors"
                      >
                        <User className="w-4 h-4 text-[#246608]" />
                        <span className="font-medium">Profile</span>
                      </button>

                      <button
                        onClick={handleSettingsClick}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-[#246608]/10 flex items-center space-x-3 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-[#246608]" />
                        <span className="font-medium">Settings</span>
                      </button>
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full border border-white/20 ${
                  scrolled
                    ? "text-white hover:bg-white/10"
                    : "text-black hover:bg-gray-100"
                }`}
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
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
              <Button
                onClick={() => handleNavigate("/meals")}
                variant="ghost"
                className={`w-full justify-start text-base font-medium font-poppins ${
                  scrolled
                    ? "text-white hover:text-yellow-200 hover:bg-white/10"
                    : "text-gray-900 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Browse Meals
              </Button>
              <Button
                onClick={() => handleNavigate("/progress")}
                variant="ghost"
                className={`w-full justify-start text-base font-medium font-poppins ${
                  scrolled
                    ? "text-white hover:text-yellow-200 hover:bg-white/10"
                    : "text-gray-900 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Progress
              </Button>
              <Button
                onClick={() => handleNavigate("/meal-plans")}
                variant="ghost"
                className={`w-full justify-start text-base font-medium font-poppins ${
                  scrolled
                    ? "text-white hover:text-yellow-200 hover:bg-white/10"
                    : "text-gray-900 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                My Plans
              </Button>
              <Button
                onClick={() => handleNavigate("/chatbot")}
                variant="ghost"
                className={`w-full justify-start text-base font-medium font-poppins ${
                  scrolled
                    ? "text-white hover:text-yellow-200 hover:bg-white/10"
                    : "text-gray-900 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                AI Coach
              </Button>

              <div className="pt-2 border-t border-white/10 mt-2 space-y-1">
                <Button
                  onClick={handleProfileClick}
                  variant="ghost"
                  className={`w-full justify-start text-sm font-medium font-poppins ${
                    scrolled
                      ? "text-white hover:text-yellow-200 hover:bg-white/10"
                      : "text-gray-900 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button
                  onClick={handleSettingsClick}
                  variant="ghost"
                  className={`w-full justify-start text-sm font-medium font-poppins ${
                    scrolled
                      ? "text-white hover:text-yellow-200 hover:bg-white/10"
                      : "text-gray-900 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start text-sm font-semibold font-poppins text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content with proper spacing for fixed navbar */}
      <main className="pt-20">{children}</main>
    </div>
  );
};

export default DashboardLayout;
