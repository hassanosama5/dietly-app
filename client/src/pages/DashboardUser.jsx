import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  LogOut,
  Sparkles,
  TrendingUp,
  Users,
  Star,
  Award,
  Stethoscope,
  Microscope,
  CheckCircle,
  Shield,
  User,
  Settings,
  Utensils,
  Target,
  TrendingDown,
  Scale,
  Heart,
  ArrowRight,
  ChefHat,
  BookOpen,
  Droplets,
  BarChart3,
  Lightbulb,
  MessageCircle,
} from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  // Debug user data to see what's available
  useEffect(() => {
    console.log("User data in Dashboard:", user);
    console.log("User healthGoal:", user?.healthGoal);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/dashboard");
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

  // Scroll to top function for navigation
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Navigation handlers with scroll to top
  const handleMealsNavigation = () => {
    navigate("/meals");
    scrollToTop();
  };

  const handleProgressNavigation = () => {
    navigate("/progress");
    scrollToTop();
  };

  const handleMealPlansNavigation = () => {
    navigate("/meal-plans");
    scrollToTop();
  };

  const handleExploreMealsNavigation = () => {
    navigate("/meals");
    scrollToTop();
  };

  const handleGeneratePlanNavigation = () => {
    navigate("/meal-plans/generate");
    scrollToTop();
  };

  // Get goal-specific content - FIXED: using healthGoal instead of goal
  const getGoalContent = () => {
    // Use the actual user healthGoal, not goal
    const goal = user?.healthGoal?.toLowerCase() || "maintain";

    console.log("Detected healthGoal:", goal); // Debug log

    if (goal === "lose") {
      return {
        title: "Weight Loss Journey",
        color: "from-[#246608] to-[#2F7A0A]",
        bgColor: "bg-gradient-to-r from-[#246608] to-[#2F7A0A]",
        tips: [
          "Focus on protein-rich meals to stay full longer",
          "Incorporate strength training to boost metabolism",
          "Stay hydrated - drink water before meals",
          "Get 7-8 hours of quality sleep nightly",
          "Track your progress with weekly weigh-ins",
        ],
        icon: <TrendingDown className="w-6 h-6" />,
      };
    } else if (goal === "gain") {
      return {
        title: "Muscle Building Journey",
        color: "from-[#246608] to-[#2F7A0A]",
        bgColor: "bg-gradient-to-r from-[#246608] to-[#2F7A0A]",
        tips: [
          "Eat every 3-4 hours to meet calorie targets",
          "Prioritize protein - aim for 1.6-2.2g per kg body weight",
          "Include complex carbs for workout energy",
          "Don't skip post-workout nutrition",
          "Progressive overload in your training",
        ],
        icon: <TrendingUp className="w-6 h-6" />,
      };
    } else {
      return {
        title: "Weight Maintenance",
        color: "from-[#246608] to-[#2F7A0A]",
        bgColor: "bg-gradient-to-r from-[#246608] to-[#2F7A0A]",
        tips: [
          "Maintain consistent eating patterns",
          "Listen to your hunger and fullness cues",
          "Stay active with activities you enjoy",
          "Weigh yourself weekly to stay on track",
          "Focus on nutrient density over calorie counting",
        ],
        icon: <Scale className="w-6 h-6" />,
      };
    }
  };

  const goalContent = getGoalContent();

  // Calculate weight difference and direction - FIXED: rounding to 1 decimal
  const getWeightInfo = () => {
    if (!user?.currentWeight || !user?.targetWeight) {
      return { difference: 0, direction: "→" };
    }

    const current = parseFloat(user.currentWeight);
    const target = parseFloat(user.targetWeight);
    const difference = Math.abs(current - target);

    // Round to 1 decimal place
    const roundedDifference = Math.round(difference * 10) / 10;

    let direction = "→";
    if (user.healthGoal === "lose" && current > target) direction = "↓";
    else if (user.healthGoal === "lose" && current < target) direction = "↑";
    else if (user.healthGoal === "gain" && current < target) direction = "↑";
    else if (user.healthGoal === "gain" && current > target) direction = "↓";

    return { difference: roundedDifference, direction };
  };

  const weightInfo = getWeightInfo();

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
            <Link to="/dashboard" className="flex items-center space-x-6">
              <img
                src={scrolled ? "/logo-white.png" : "/logo-green.png"}
                alt="Logo"
                className="w-24 h-24 md:w-32 md:h-32 cursor-pointer"
              />
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Button
                onClick={handleMealsNavigation}
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
                onClick={handleProgressNavigation}
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
                onClick={handleMealPlansNavigation}
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
                onClick={() => navigate("/chatbot")}
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
                <MessageCircle className="w-4 h-4 mr-1" />
                AI Coach
              </Button>

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
          </div>
        </div>
      </nav>

      {/* ==================== PERSONALIZED HERO SECTION ==================== */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Personal Welcome & Weight Display */}
            <div className="space-y-8">
              <div className="space-y-6">
                {/* Welcome Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#246608]/10 border border-[#246608]/20 rounded-full">
                  <Sparkles className="w-4 h-4 text-[#246608]" />
                  <span className="text-xs font-semibold text-[#246608] tracking-widest">
                    WELCOME BACK,{" "}
                    {user?.name?.split(" ")[0]?.toUpperCase() || "HERO"}!
                  </span>
                </div>

                {/* Current Weight Display */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-700">
                    Your Current Weight
                  </h2>
                  <div className="flex items-end gap-4">
                    <div className="text-7xl lg:text-8xl font-bold text-[#246608]">
                      {user?.currentWeight || 0}
                    </div>
                    <div className="text-2xl text-gray-600 mb-4">kg</div>
                  </div>

                  {/* Goal Progress */}
                  {user?.targetWeight && (
                    <div className="flex items-center gap-3 text-lg text-gray-600">
                      <Target className="w-5 h-5 text-[#246608]" />
                      <span>Goal: {user.targetWeight} kg</span>
                      {user.currentWeight && (
                        <span className="text-sm px-2 py-1 bg-gray-100 rounded-full">
                          {weightInfo.direction}
                          {weightInfo.difference} kg to go
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Goal Status - Now shows correct goal based on healthGoal */}
                <div
                  className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg ${goalContent.bgColor} text-white`}
                >
                  {goalContent.icon}
                  <span className="font-semibold">{goalContent.title}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-4 flex-wrap">
                <Button
                  onClick={handleProgressNavigation}
                  size="lg"
                  className="px-6 py-4 bg-[#246608] hover:bg-[#1a4a06] transition-all duration-300 text-base font-semibold"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  TRACK PROGRESS
                </Button>
              </div>
            </div>

            {/* Right Column - Visual Progress */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
                <div className="text-center space-y-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Your Journey
                  </h3>

                  {/* Progress Visualization - Cool animated version */}
                  <div className="relative h-48 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#246608]">
                            {user?.currentWeight || 0}
                          </div>
                          <div className="text-sm text-gray-500">kg</div>
                        </div>
                      </div>
                    </div>

                    {/* Animated rings */}
                    <div className="absolute inset-0">
                      <div className="w-full h-full rounded-full border-4 border-transparent border-t-[#246608] border-r-[#246608]/30 animate-spin-slow"></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-[#246608]">0</div>
                      <div className="text-xs text-gray-500">Weeks</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#246608]">0</div>
                      <div className="text-xs text-gray-500">Meals</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#246608]">0%</div>
                      <div className="text-xs text-gray-500">Progress</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== GOAL-SPECIFIC TIPS ==================== */}
      <section className="relative py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Personalized Tips for Your Goal
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Expert recommendations tailored specifically for your{" "}
              {user?.healthGoal?.toLowerCase() || "fitness"} journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goalContent.tips.map((tip, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-r from-[#246608] to-[#2F7A0A] flex items-center justify-center flex-shrink-0`}
                    >
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-gray-700 leading-relaxed">{tip}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={handleProgressNavigation}
              variant="outline"
              size="lg"
              className="border-2 border-[#246608] text-[#246608] hover:bg-[#246608]/10"
            >
              VIEW DETAILED GUIDANCE
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ==================== MEAL LIBRARY ADVERTISEMENT ==================== */}
      <section className="relative py-20 bg-gradient-to-br from-[#246608] to-[#2F7A0A] text-white">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                  <ChefHat className="w-4 h-4" />
                  <span className="text-sm font-semibold tracking-widest">
                    EXPLORE OUR COLLECTION
                  </span>
                </div>

                <h2 className="text-5xl font-bold leading-tight">
                  Discover Our
                  <br />
                  <span className="text-yellow-300">400+ Meal</span>
                  <br />
                  Recipe Library
                </h2>

                <p className="text-lg text-white/90 leading-relaxed">
                  From quick weekday dinners to gourmet diet recipes, find
                  perfect meals for every occasion. All nutritionist-approved
                  and calorie-controlled for your goals.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-yellow-300" />
                    <span>Regular & Diet Options</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-yellow-300" />
                    <span>AI-Personalized</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-yellow-300" />
                    <span>Quick & Easy Recipes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-yellow-300" />
                    <span>Nutritionist Approved</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={handleExploreMealsNavigation}
                  size="lg"
                  className="px-8 py-6 bg-white text-[#246608] hover:bg-gray-100 hover:shadow-2xl transition-all duration-300 font-bold"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  EXPLORE MEAL LIBRARY
                </Button>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  {/* Meal preview cards */}
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="w-full h-24 bg-white/10 rounded mb-3 flex items-center justify-center">
                        <Utensils className="w-8 h-8 text-white/60" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-white">
                          Premium Meal #{item}
                        </div>
                        <div className="text-xs text-white/60">350-550 cal</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <div className="text-3xl font-bold text-yellow-300">400+</div>
                  <div className="text-white/80">Recipes Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== DAILY INSIGHTS SECTION ==================== */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#246608]/10 border border-[#246608]/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#246608]" />
              <span className="text-xs font-semibold text-[#246608] tracking-widest">
                DAILY INSIGHTS
              </span>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Today's Nutrition Spotlight
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Smart tips and insights to keep you motivated and informed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Hydration Tracker */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Hydration Check</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Stay on track with your daily water intake for optimal
                metabolism and energy levels.
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
                  <div
                    key={`glass-${glass}`}
                    className="flex-1 h-2 rounded-full bg-gray-200"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                8 glasses recommended today
              </p>
            </div>

            {/* Weekly Progress */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Weekly Overview</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Consistency is key! Track your meals and activities throughout
                the week.
              </p>
              <div className="flex justify-between text-xs">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day, index) => (
                    <div key={`${day}-${index}`} className="text-center">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-1">
                        {index < 3 ? "✓" : day.charAt(0)}
                      </div>
                      <div className="text-gray-500">{day}</div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Nutrition Tip */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800">
                  Smart Eating Tip
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {user?.healthGoal === "lose"
                  ? "Try eating protein-rich foods first to feel full faster and reduce overall calorie intake."
                  : user?.healthGoal === "gain"
                  ? "Include healthy fats like avocado and nuts to boost calorie intake without feeling overly full."
                  : "Focus on balanced meals with protein, carbs, and fats to maintain your current weight effectively."}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 rounded-full bg-[#246608]"></div>
                Updated daily based on your goals
              </div>
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-[#246608]/5 to-[#2F7A0A]/5 rounded-2xl p-8 max-w-2xl mx-auto">
              <p className="text-lg text-gray-700 italic mb-4">
                "Small, consistent choices lead to lasting changes. Every
                healthy meal is a step toward your goals."
              </p>
              <p className="text-sm text-gray-500">— Your Dietly AI Coach</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative border-t border-[#246608]/20 py-10 bg-white">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-[#246608]/70">
              © 2025 Dietly AI. Created by Team One
            </p>
            <div className="flex gap-8 text-sm text-[#246608]/70">
              <button className="hover:text-[#246608] transition-colors">
                Privacy
              </button>
              <button className="hover:text-[#246608] transition-colors">
                Terms
              </button>
              <button className="hover:text-[#246608] transition-colors">
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
