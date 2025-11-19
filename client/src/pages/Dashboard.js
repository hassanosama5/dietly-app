// src/pages/Dashboard/Dashboard.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, isProfileComplete, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* TEST PANEL - Remove this after testing */}
        <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-bold text-yellow-800 mb-2">
            🧪 Profile Completion Test
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <strong>Profile Complete:</strong>{" "}
                {isProfileComplete ? "✅ YES" : "❌ NO"}
              </p>
              <p>
                <strong>User ID:</strong> {user?._id}
              </p>
              <p>
                <strong>Name:</strong> {user?.name}
              </p>
            </div>
            <div>
              <p>
                <strong>Age:</strong> {user?.age || "❌ Missing"}
              </p>
              <p>
                <strong>Gender:</strong> {user?.gender || "❌ Missing"}
              </p>
              <p>
                <strong>Height:</strong> {user?.height || "❌ Missing"} cm
              </p>
              <p>
                <strong>Weight:</strong> {user?.currentWeight || "❌ Missing"}{" "}
                kg
              </p>
              <p>
                <strong>Target:</strong> {user?.targetWeight || "❌ Missing"} kg
              </p>
              <p>
                <strong>Goal:</strong> {user?.healthGoal || "❌ Missing"}
              </p>
              <p>
                <strong>Activity:</strong> {user?.activityLevel || "❌ Missing"}
              </p>
            </div>
          </div>
        </div>

        {/* Regular Dashboard Content */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name}!
          </h1>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Dashboard</h2>

          {isProfileComplete ? (
            <div className="text-green-600 mb-4">
              ✅ Your profile is complete! You can now generate meal plans.
            </div>
          ) : (
            <div className="text-red-600 mb-4">
              ❌ Your profile is incomplete. Please complete your profile to
              access all features.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Daily Calorie Target</h3>
              <p className="text-2xl font-bold text-blue-600">
                {user?.dailyCalorieTarget || "Not set"}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Health Goal</h3>
              <p className="text-lg capitalize">
                {user?.healthGoal || "Not set"}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isProfileComplete}
              >
                {isProfileComplete
                  ? "Generate Meal Plan"
                  : "Complete Profile to Generate Meal Plan"}
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full text-left">
                Track Progress
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full text-left">
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
