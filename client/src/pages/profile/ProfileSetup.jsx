import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Button } from "../../components/ui/button";
import { Calendar } from "lucide-react";

const ProfileSetup = () => {
  const { user, updateProfile, finalizeRegistration, loading, clearJustRegistered } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [selectedActivityLevel, setSelectedActivityLevel] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("Egypt");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [currentWeightKg, setCurrentWeightKg] = useState(""); // Store in kg for metric
  const [targetWeightKg, setTargetWeightKg] = useState(""); // Store in kg for metric
  const [heightUnit, setHeightUnit] = useState("imperial"); // "imperial" or "metric"
  const [weightUnit, setWeightUnit] = useState("imperial"); // "imperial" or "metric"
  const [weeklyGoal, setWeeklyGoal] = useState(""); // Weekly weight change goal
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    clearJustRegistered();
  }, [clearJustRegistered]);

  // Set default weekly goal when step 5 is reached
  useEffect(() => {
    if (currentStep === 5 && !weeklyGoal && selectedGoal) {
      // Set recommended option as default
      if (selectedGoal === "lose" || selectedGoal === "gain") {
        setWeeklyGoal("0.25"); // Recommended for lose/gain
      } else {
        setWeeklyGoal("0"); // Recommended for maintain
      }
    }
  }, [currentStep, selectedGoal, weeklyGoal]);

  if (loading) return <LoadingSpinner />;

  const goals = [
    { id: "lose", label: "Lose weight", value: "lose" },
    { id: "maintain", label: "Maintain weight", value: "maintain" },
    { id: "gain", label: "Gain weight", value: "gain" },
  ];

  const activityLevels = [
    {
      id: "sedentary",
      label: "Not Very Active",
      description: "Spend most of the day sitting (e.g., bankteller, desk job)",
      value: "sedentary",
    },
    {
      id: "light",
      label: "Lightly Active",
      description: "Spend a good part of the day on your feet (e.g., teacher, salesperson)",
      value: "light",
    },
    {
      id: "active",
      label: "Active",
      description: "Spend a good part of the day doing some physical activity (e.g., food server, postal carrier)",
      value: "active",
    },
    {
      id: "very_active",
      label: "Very Active",
      description: "Spend a good part of the day doing heavy physical activity (e.g., bike messenger, carpenter)",
      value: "very_active",
    },
  ];

  const handleGoalSelect = (goalValue) => {
    setSelectedGoal(goalValue);
    // Reset weekly goal if user changes goal to maintain
    if (goalValue === "maintain") {
      setWeeklyGoal("");
    }
  };

  const handleActivityLevelSelect = (activityValue) => {
    setSelectedActivityLevel(activityValue);
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Convert feet and inches to cm
  const feetInchesToCm = (feet, inches) => {
    const totalInches = parseFloat(feet) * 12 + parseFloat(inches);
    return totalInches * 2.54;
  };

  // Convert lbs to kg
  const lbsToKg = (lbs) => {
    return parseFloat(lbs) * 0.453592;
  };

  // Convert cm to feet and inches
  const cmToFeetInches = (cm) => {
    const totalInches = parseFloat(cm) / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  };

  // Convert kg to lbs
  const kgToLbs = (kg) => {
    return parseFloat(kg) * 2.20462;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Step 1: Goals selection
      if (!selectedGoal) {
        return;
      }
      // Save goal and move to next step
      setIsSubmitting(true);
      if (user) {
        const profileData = { healthGoal: selectedGoal };
        await updateProfile(profileData);
      }
      setIsSubmitting(false);
      setCurrentStep(2);
      // Reset weekly goal if goal is "maintain"
      if (selectedGoal === "maintain") {
        setWeeklyGoal("");
      }
    } else if (currentStep === 2) {
      // Step 2: Activity level selection
      if (!selectedActivityLevel) {
        return;
      }
      // Save activity level and move to next step
      setIsSubmitting(true);
      if (user) {
        const profileData = { activityLevel: selectedActivityLevel };
        await updateProfile(profileData);
      }
      setIsSubmitting(false);
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Step 3: Personal information
      if (!selectedGender || !dateOfBirth) {
        return;
      }
      // Calculate age from date of birth
      const age = calculateAge(dateOfBirth);
      setIsSubmitting(true);
      if (user) {
        const profileData = { gender: selectedGender, age };
        await updateProfile(profileData);
      }
      setIsSubmitting(false);
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Step 4: Height and weight
      if (weightUnit === "imperial" && (!currentWeight || !targetWeight)) {
        return;
      }
      if (weightUnit === "metric" && (!currentWeightKg || !targetWeightKg)) {
        return;
      }
      if (heightUnit === "imperial" && (!heightFeet || !heightInches)) {
        return;
      }
      if (heightUnit === "metric" && !heightCm) {
        return;
      }
      
      // Convert height to cm
      let heightInCm;
      if (heightUnit === "imperial") {
        heightInCm = feetInchesToCm(heightFeet, heightInches);
      } else {
        heightInCm = parseFloat(heightCm);
      }

      // Convert weight to kg
      let currentWeightKgValue, targetWeightKgValue;
      if (weightUnit === "imperial") {
        currentWeightKgValue = lbsToKg(currentWeight);
        targetWeightKgValue = lbsToKg(targetWeight);
      } else {
        currentWeightKgValue = parseFloat(currentWeightKg || 0);
        targetWeightKgValue = parseFloat(targetWeightKg || 0);
      }

      setIsSubmitting(true);
      // Calculate age from date of birth
      const age = calculateAge(dateOfBirth);
      
      // Send ALL required fields together to ensure profile is complete
      const profileData = {
        height: Math.round(heightInCm),
        currentWeight: Math.round(currentWeightKgValue * 10) / 10, // Round to 1 decimal
        targetWeight: Math.round(targetWeightKgValue * 10) / 10,
        age: age,
        gender: selectedGender,
        healthGoal: selectedGoal,
        activityLevel: selectedActivityLevel,
      };
      
      // For "maintain" goal, mark setup as complete after step 4
      if (selectedGoal === "maintain") {
        profileData.profileSetupComplete = true;
      }
      
      try {
        if (user) {
          await updateProfile(profileData);
          setIsSubmitting(false);
          if (selectedGoal === "maintain") {
            setTimeout(() => {
              window.location.replace("/user-dashboard");
            }, 2000);
          } else {
            setCurrentStep(5);
          }
        } else {
          if (selectedGoal === "maintain") {
            const result = await finalizeRegistration(profileData);
            setIsSubmitting(false);
            if (result.success) {
              setTimeout(() => {
                window.location.replace("/user-dashboard");
              }, 1000);
            }
          } else {
            setIsSubmitting(false);
            setCurrentStep(5);
          }
        }
      } catch (error) {
        setIsSubmitting(false);
      }
    } else if (currentStep === 5) {
      // Step 5: Weekly goal selection (for lose/gain goals only)
      if (!weeklyGoal) {
        return;
      }
      
      // For "lose" or "gain" goals, save a flag to indicate step 5 is complete
      // This allows the profile completion check to know step 5 was completed
      setIsSubmitting(true);
      
      // Save a profileSetupComplete flag to mark that step 5 is done
      try {
        if (user) {
          const profileData = { profileSetupComplete: true };
          await updateProfile(profileData);
          setIsSubmitting(false);
          setTimeout(() => {
            window.location.replace("/user-dashboard");
          }, 2000);
        } else {
          const age = calculateAge(dateOfBirth);
          let heightInCm;
          if (heightUnit === "imperial") {
            heightInCm = feetInchesToCm(heightFeet, heightInches);
          } else {
            heightInCm = parseFloat(heightCm);
          }
          let currentWeightKgValue, targetWeightKgValue;
          if (weightUnit === "imperial") {
            currentWeightKgValue = lbsToKg(currentWeight);
            targetWeightKgValue = lbsToKg(targetWeight);
          } else {
            currentWeightKgValue = parseFloat(currentWeightKg || 0);
            targetWeightKgValue = parseFloat(targetWeightKg || 0);
          }
          const payload = {
            height: Math.round(heightInCm),
            currentWeight: Math.round(currentWeightKgValue * 10) / 10,
            targetWeight: Math.round(targetWeightKgValue * 10) / 10,
            age,
            gender: selectedGender,
            healthGoal: selectedGoal,
            activityLevel: selectedActivityLevel,
            profileSetupComplete: true,
          };
          const result = await finalizeRegistration(payload);
          setIsSubmitting(false);
          if (result.success) {
            setTimeout(() => {
              window.location.replace("/user-dashboard");
            }, 1000);
          }
        }
      } catch (error) {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate("/register");
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    } else if (currentStep === 5) {
      setCurrentStep(4);
    }
  };

  // Get user's first name or use "there" as fallback
  const userName = user?.name?.split(" ")[0] || "there";

  // Calculate progress percentage
  // If goal is "maintain", step 5 is skipped, so step 4 is the final step
  const isMaintainGoal = selectedGoal === "maintain";
  const progressPercentage = 
    currentStep === 1 ? 20 : 
    currentStep === 2 ? 40 : 
    currentStep === 3 ? 60 : 
    currentStep === 4 ? (isMaintainGoal ? 100 : 80) :
    100;

  // Weekly goal options based on health goal
  const getWeeklyGoalOptions = () => {
    if (selectedGoal === "lose") {
      return [
        { value: "0.25", label: "Lose 0.25 kilograms per week (Recommended)", recommended: true },
        { value: "0.5", label: "Lose 0.5 kilograms per week" },
      ];
    } else if (selectedGoal === "gain") {
      return [
        { value: "0.25", label: "Gain 0.25 kilograms per week (Recommended)", recommended: true },
        { value: "0.5", label: "Gain 0.5 kilograms per week" },
      ];
    } else {
      // maintain
      return [
        { value: "0", label: "Maintain current weight (Recommended)", recommended: true },
      ];
    }
  };

  // List of countries (simplified - you can expand this)
  const countries = [
    "Egypt",
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "Japan",
    "China",
    "India",
    "Brazil",
    "Mexico",
    "Argentina",
    "South Africa",
    "Saudi Arabia",
    "United Arab Emirates",
    "Turkey",
    "Russia",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Progress Bar - Connected to card */}
          <div className="w-full bg-gray-200 h-2">
            <div
              className="bg-[#246608] h-2 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="p-8">
            {/* Step 1: Goals Selection */}
            {currentStep === 1 && (
              <>
                {/* Title */}
                <h1 className="text-3xl font-bold mb-2 text-gray-900 text-center">
                  Thanks {userName}! Now for your goals.
                </h1>

                {/* Instructions */}
                <p className="text-gray-600 mb-8 text-lg text-center">
                  Select up to 3 that are important to you, including one weight goal.
                </p>

              {/* Goals Selection */}
              <div className="space-y-3 mb-8">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => handleGoalSelect(goal.value)}
                    className={`w-full py-4 px-6 rounded-lg text-left font-medium text-gray-900 transition-all duration-200 ${
                      selectedGoal === goal.value
                        ? "bg-[#246608] text-white shadow-md"
                        : "bg-white border-2 border-gray-200 hover:border-[#246608]/60 hover:bg-[#246608]/10"
                    }`}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>
            </>
          )}

            {/* Step 2: Activity Level Selection */}
            {currentStep === 2 && (
              <>
                {/* Title */}
                <h1 className="text-2xl font-bold mb-2 text-gray-900 text-center">
                  What is your baseline activity level?
                </h1>

                {/* Subtitle */}
                <p className="text-gray-500 mb-8 text-base text-center">
                  Not including workouts—we count that separately.
                </p>

                {/* Activity Level Selection */}
                <div className="space-y-3 mb-8">
                  {activityLevels.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => handleActivityLevelSelect(level.value)}
                      className={`w-full py-4 px-6 rounded-lg text-left transition-all duration-200 ${
                        selectedActivityLevel === level.value
                          ? "bg-white border-2 border-[#246608] shadow-md"
                          : "bg-white border-2 border-gray-200 hover:border-[#246608]/60 hover:bg-[#246608]/10"
                      }`}
                    >
                      <div
                        className={`font-medium mb-1 ${
                          selectedActivityLevel === level.value
                            ? "text-[#246608]"
                            : "text-gray-900"
                        }`}
                      >
                        {level.label}
                      </div>
                      <div className="text-sm text-gray-600">{level.description}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Step 3: Personal Information */}
            {currentStep === 3 && (
              <>
                <div className="space-y-6 mb-8">
                  {/* Sex Selection */}
                  <div>
                    <h2 className="text-lg font-bold mb-4 text-gray-900">
                      What's your gender?
                    </h2>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setSelectedGender("male")}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                          selectedGender === "male"
                            ? "border-[#246608] bg-[#246608]/10 text-[#246608] font-medium"
                            : "border-gray-200 hover:border-[#246608]/60 text-gray-700"
                        }`}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedGender("female")}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                          selectedGender === "female"
                            ? "border-[#246608] bg-[#246608]/10 text-[#246608] font-medium"
                            : "border-gray-200 hover:border-[#246608]/60 text-gray-700"
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <h2 className="text-lg font-bold mb-4 text-gray-900">
                      When were you born?
                    </h2>
                    <div className="relative">
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                        className="w-full py-3 px-4 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#246608] focus:border-[#246608]"
                        placeholder="mm/dd/yyyy"
                      />
                      <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Country Selection */}
                  <div>
                    <h2 className="text-lg font-bold mb-4 text-gray-900">
                      Where do you live?
                    </h2>
                    <div className="relative">
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full py-3 px-4 pr-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#246608] focus:border-[#246608] appearance-none bg-white"
                      >
                        {countries.map((countryName) => (
                          <option key={countryName} value={countryName}>
                            {countryName}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Info Text */}
                  <p className="text-sm text-gray-500">
                    We use this information to calculate an accurate calorie goal for you.
                  </p>
                </div>
              </>
            )}

            {/* Step 4: Height and Weight */}
            {currentStep === 4 && (
              <>
                <div className="space-y-6 mb-8">
                  {/* Height Section */}
                  <div>
                    <h2 className="text-lg font-bold mb-4 text-gray-900">
                      How tall are you?
                    </h2>
                    {heightUnit === "imperial" ? (
                      <>
                        <div className="flex gap-4 mb-2">
                          <div className="flex-1">
                            <div className="relative">
                              <input
                                type="number"
                                value={heightFeet}
                                onChange={(e) => setHeightFeet(e.target.value)}
                                placeholder="Height (feet)"
                                min="0"
                                max="8"
                                className="w-full py-3 px-4 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#246608] focus:border-[#246608]"
                              />
                              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                                ft
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="relative">
                              <input
                                type="number"
                                value={heightInches}
                                onChange={(e) => setHeightInches(e.target.value)}
                                placeholder="Height (inches)"
                                min="0"
                                max="11"
                                className="w-full py-3 px-4 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#246608] focus:border-[#246608]"
                              />
                              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                                in
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            // Convert to cm when switching
                            if (heightFeet && heightInches) {
                              const cm = feetInchesToCm(heightFeet, heightInches);
                              setHeightCm(Math.round(cm).toString());
                            }
                            setHeightUnit("metric");
                          }}
                          className="text-[#246608] text-sm hover:underline"
                        >
                          Change units to centimeters
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="relative mb-2">
                          <input
                            type="number"
                            value={heightCm}
                            onChange={(e) => setHeightCm(e.target.value)}
                            placeholder="Height (cm)"
                            min="0"
                            className="w-full py-3 px-4 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#246608] focus:border-[#246608]"
                          />
                          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                            cm
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            // Convert to feet/inches when switching
                            if (heightCm) {
                              const { feet, inches } = cmToFeetInches(heightCm);
                              setHeightFeet(feet.toString());
                              setHeightInches(inches.toString());
                            }
                            setHeightUnit("imperial");
                          }}
                          className="text-[#246608] text-sm hover:underline"
                        >
                          Change units to feet and inches
                        </button>
                      </>
                    )}
                  </div>

                  {/* Current Weight Section */}
                  <div>
                    <h2 className="text-lg font-bold mb-2 text-gray-900">
                      How much do you weigh?
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                      It's OK to estimate. You can update this later.
                    </p>
                    {weightUnit === "imperial" ? (
                      <>
                        <div className="relative mb-2">
                          <input
                            type="number"
                            value={currentWeight}
                            onChange={(e) => setCurrentWeight(e.target.value)}
                            placeholder="Current weight"
                            min="0"
                            step="0.1"
                            className="w-full py-3 px-4 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#246608] focus:border-[#246608]"
                          />
                          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                            lbs
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            // Convert to kg when switching
                            if (currentWeight) {
                              const kg = lbsToKg(currentWeight);
                              setCurrentWeightKg(Math.round(kg * 10) / 10);
                            }
                            if (targetWeight) {
                              const kg = lbsToKg(targetWeight);
                              setTargetWeightKg(Math.round(kg * 10) / 10);
                            }
                            setWeightUnit("metric");
                          }}
                          className="text-[#246608] text-sm hover:underline"
                        >
                          Change units to kilograms/stone
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="relative mb-2">
                          <input
                            type="number"
                            value={currentWeightKg}
                            onChange={(e) => setCurrentWeightKg(e.target.value)}
                            placeholder="Current weight"
                            min="0"
                            step="0.1"
                            className="w-full py-3 px-4 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#246608] focus:border-[#246608]"
                          />
                          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                            kg
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            // Convert to lbs when switching
                            if (currentWeightKg) {
                              const lbs = kgToLbs(currentWeightKg);
                              setCurrentWeight(Math.round(lbs * 10) / 10);
                            }
                            if (targetWeightKg) {
                              const lbs = kgToLbs(targetWeightKg);
                              setTargetWeight(Math.round(lbs * 10) / 10);
                            }
                            setWeightUnit("imperial");
                          }}
                          className="text-[#246608] text-sm hover:underline"
                        >
                          Change units to pounds
                        </button>
                      </>
                    )}
                  </div>

                  {/* Target Weight Section */}
                  <div>
                    <h2 className="text-lg font-bold mb-2 text-gray-900">
                      What's your goal weight?
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                      Don't worry. This doesn't affect your daily calorie goal and you can always change it later.
                    </p>
                    <div className="relative">
                      <input
                        type="number"
                        value={weightUnit === "imperial" ? targetWeight : targetWeightKg}
                        onChange={(e) => {
                          if (weightUnit === "imperial") {
                            setTargetWeight(e.target.value);
                          } else {
                            setTargetWeightKg(e.target.value);
                          }
                        }}
                        placeholder="Goal weight"
                        min="0"
                        step="0.1"
                        className="w-full py-3 px-4 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#246608] focus:border-[#246608]"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                        {weightUnit === "imperial" ? "lbs" : "kg"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 5: Weekly Goal Selection */}
            {currentStep === 5 && (
              <>
                {/* Title */}
                <h1 className="text-2xl font-bold mb-2 text-gray-900 text-center">
                  What is your weekly goal?
                </h1>

                {/* Instructions */}
                <p className="text-gray-500 mb-8 text-base text-center">
                  Choose a weekly pace that feels sustainable for you. Consistency is key to long-term success.
                </p>

                {/* Weekly Goal Options */}
                <div className="space-y-3 mb-8">
                  {getWeeklyGoalOptions().map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setWeeklyGoal(option.value)}
                      className={`w-full py-4 px-6 rounded-lg text-left transition-all duration-200 ${
                        weeklyGoal === option.value
                          ? "bg-white border-2 border-[#246608] shadow-md"
                          : "bg-white border-2 border-gray-200 hover:border-[#246608]/60 hover:bg-[#246608]/10"
                      }`}
                    >
                      <div
                        className={`font-medium ${
                          weeklyGoal === option.value
                            ? "text-[#246608]"
                            : "text-gray-900"
                        }`}
                      >
                        {option.label}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                className="flex-1 border-2 border-[#246608] text-[#246608] hover:bg-[#246608]/10 rounded-lg py-3 font-semibold"
              >
                BACK
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !selectedGoal) ||
                  (currentStep === 2 && !selectedActivityLevel) ||
                  (currentStep === 3 && (!selectedGender || !dateOfBirth)) ||
                  (currentStep === 4 && 
                    ((weightUnit === "imperial" && (!currentWeight || !targetWeight)) ||
                     (weightUnit === "metric" && (!currentWeightKg || !targetWeightKg)) ||
                     (heightUnit === "imperial" && (!heightFeet || !heightInches)) ||
                     (heightUnit === "metric" && !heightCm))) ||
                  (currentStep === 5 && !weeklyGoal) ||
                  isSubmitting
                }
                className="flex-1 bg-[#246608] hover:bg-[#246608]/90 text-white rounded-lg py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "NEXT"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
