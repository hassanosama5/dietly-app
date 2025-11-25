// client/src/components/layout/DashboardLayout.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { User, Settings, LogOut } from "lucide-react";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const handleLogout = () => {
  logout();
  navigate("/login");
  setIsDropdownOpen(false);
};

const handleProfileClick = () => {
  navigate("/profile");
  setIsDropdownOpen(false);
};

const handleSettingsClick = () => {
  navigate("/settings");
  setIsDropdownOpen(false);
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
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-6">
              <img
                src={scrolled ? "/logo-white.png" : "/logo-green.png"}
                alt="Logo"
                className="w-24 h-24 md:w-32 md:h-32 cursor-pointer"
                onClick={() => navigate("/dashboard")}
              />
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Button
                onClick={() => navigate("/meals")}
                variant="ghost"
                size="sm"
                className={`
                  text-base font-medium transition-colors duration-300
                  ${
                    scrolled
                      ? "text-gray-400 hover:text-white hover:bg-white/5"
                      : "text-black hover:text-gray-600 hover:bg-gray-100"
                  }
                  font-poppins
                `}
              >
                Meals
              </Button>

              <Button
                onClick={() => navigate("/progress")}
                variant="ghost"
                size="sm"
                className={`
                  text-base font-medium transition-colors duration-300
                  ${
                    scrolled
                      ? "text-gray-400 hover:text-white hover:bg-white/5"
                      : "text-black hover:text-gray-600 hover:bg-gray-100"
                  }
                  font-poppins
                `}
              >
                Progress
              </Button>

              <Button
                onClick={() => navigate("/meal-plans")}
                variant="ghost"
                size="sm"
                className={`
                  text-base font-medium transition-colors duration-300
                  ${
                    scrolled
                      ? "text-gray-400 hover:text-white hover:bg-white/5"
                      : "text-black hover:text-gray-600 hover:bg-gray-100"
                  }
                  font-poppins
                `}
              >
                My Plans
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
        <p className="text-sm font-semibold text-gray-900">{user?.name || "User"}</p>
        <p className="text-xs text-gray-500 truncate">{user?.email || "user@example.com"}</p>
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
          </div>
        </div>
      </nav>

      {/* Main Content with proper spacing for fixed navbar */}
      <main className="pt-20">{children}</main>
    </div>
  );
};

export default DashboardLayout;
