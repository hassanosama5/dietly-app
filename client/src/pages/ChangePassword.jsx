import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { authService } from "../services/authService";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  try {
    // Make API call to change password using authService
    await authService.changePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });

    // Success
    alert("Password changed successfully!");
    navigate("/settings");

  } catch (error) {
    console.error("Error changing password:", error);
    alert("Failed to change password: " + error.message);
  }
};

     

   

  return (
    <div className="min-h-screen bg-gray-50 py-12 font-poppins">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center text-[#246608] hover:text-[#2F7A0A] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Settings
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Change Password
          </h1>
          <p className="text-gray-600">
            Update your password to keep your account secure
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg border border-gray-200">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 mr-2 text-[#246608]" />
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#246608] focus:border-transparent ${
                      errors.currentPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 mr-2 text-[#246608]" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#246608] focus:border-transparent ${
                      errors.newPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Password must be at least 6 characters
                </p>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 mr-2 text-[#246608]" />
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#246608] focus:border-transparent ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-[#246608] hover:bg-[#2F7A0A] text-white py-3"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate("/settings")}
                  variant="outline"
                  className="flex-1 border-gray-300 hover:bg-gray-100 py-3"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card className="mt-6 bg-blue-50 border border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-blue-600" />
              Password Security Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Use at least 8 characters with a mix of letters, numbers, and symbols
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Don't use personal information like your name or birthday
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Use a unique password that you don't use for other accounts
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Consider using a password manager to generate and store passwords
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;