import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Weight,
  Target,
  Activity,
  LogOut,
  Edit2,
  Save,
  X,
} from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    age: user?.age || "",
    currentWeight: user?.currentWeight || "",
    targetWeight: user?.targetWeight || "",
    height: user?.height || "",
    activityLevel: user?.activityLevel || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log("Saving profile:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      age: user?.age || "",
      currentWeight: user?.currentWeight || "",
      targetWeight: user?.targetWeight || "",
      height: user?.height || "",
      activityLevel: user?.activityLevel || "",
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 font-poppins">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <Card className="mb-6 shadow-lg border border-gray-200">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2F7A0A] to-[#246608] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user?.name || "User"}
                  </h2>
                  <p className="text-gray-600">{user?.email || "No email"}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-[#246608]/10 text-[#246608] text-sm font-semibold rounded-full">
                    Active Member
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#246608] hover:bg-[#2F7A0A] text-white"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSave}
                      className="bg-[#246608] hover:bg-[#2F7A0A] text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="border-gray-300 hover:bg-gray-100"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 mr-2 text-[#246608]" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#246608] focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {user?.name || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 mr-2 text-[#246608]" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#246608] focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {user?.email || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 mr-2 text-[#246608]" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#246608] focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {user?.phone || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 mr-2 text-[#246608]" />
                    Age
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="25"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#246608] focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {user?.age || "Not provided"} years
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Health & Fitness
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Weight className="w-4 h-4 mr-2 text-[#246608]" />
                    Current Weight
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="currentWeight"
                      value={formData.currentWeight}
                      onChange={handleInputChange}
                      placeholder="70"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#246608] focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {user?.currentWeight || "Not provided"} kg
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Target className="w-4 h-4 mr-2 text-[#246608]" />
                    Target Weight
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="targetWeight"
                      value={formData.targetWeight}
                      onChange={handleInputChange}
                      placeholder="65"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#246608] focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {user?.targetWeight || "Not provided"} kg
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Activity className="w-4 h-4 mr-2 text-[#246608]" />
                    Height
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      placeholder="170"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#246608] focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {user?.height || "Not provided"} cm
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Activity className="w-4 h-4 mr-2 text-[#246608]" />
                    Activity Level
                  </label>
                  {isEditing ? (
                    <select
                      name="activityLevel"
                      value={formData.activityLevel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#246608] focus:border-transparent"
                    >
                      <option value="">Select activity level</option>
                      <option value="sedentary">Sedentary</option>
                      <option value="light">Lightly Active</option>
                      <option value="moderate">Moderately Active</option>
                      <option value="very">Very Active</option>
                      <option value="extra">Extra Active</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium capitalize">
                      {user?.activityLevel || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-[#246608]/10 rounded-lg">
                  <Target className="w-6 h-6 text-[#246608]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weight Goal</p>
                  <p className="text-lg font-bold text-gray-900">
                    {user?.targetWeight || "N/A"} kg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">BMI</p>
                  <p className="text-lg font-bold text-gray-900">
                    {user?.height && user?.currentWeight
                      ? (
                          user.currentWeight /
                          ((user.height / 100) * (user.height / 100))
                        ).toFixed(1)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Weight className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-lg font-bold text-gray-900">
                    {user?.currentWeight && user?.targetWeight
                      ? Math.abs(user.currentWeight - user.targetWeight).toFixed(1)
                      : "N/A"}{" "}
                    kg to go
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Account Actions
                </h3>
                <p className="text-sm text-gray-600">
                  Manage your account settings
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;