import React from "react";
import { Coffee, Sun, Moon, Cookie } from "lucide-react";

const CalorieRing = ({
  totalCalories = 2000,
  breakfast = 0,
  lunch = 0,
  dinner = 0,
  snacks = 0
}) => {
  const size = 240;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const consumed = breakfast + lunch + dinner + snacks;
  const remaining = Math.max(0, totalCalories - consumed);
  const percentConsumed = Math.min(100, (consumed / totalCalories) * 100);

  // Calculate the percentage of each meal type relative to total calories
  const breakfastPercent = (breakfast / totalCalories) * 100;
  const lunchPercent = (lunch / totalCalories) * 100;
  const dinnerPercent = (dinner / totalCalories) * 100;
  const snacksPercent = (snacks / totalCalories) * 100;

  // Calculate cumulative percentages for positioning
  const breakfastEnd = breakfastPercent;
  const lunchEnd = breakfastEnd + lunchPercent;
  const dinnerEnd = lunchEnd + dinnerPercent;
  const snacksEnd = dinnerEnd + snacksPercent;

  // Convert percentages to stroke dash values
  const toStrokeDash = (percent) => (percent / 100) * circumference;

  const mealColors = {
    breakfast: "#FF9500", // Orange
    lunch: "#34C759",     // Green
    dinner: "#AF52DE",    // Purple
    snacks: "#FF2D55"     // Pink
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Breakfast Segment */}
          {breakfast > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={mealColors.breakfast}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${toStrokeDash(breakfastPercent)} ${circumference}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          )}

          {/* Lunch Segment */}
          {lunch > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={mealColors.lunch}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${toStrokeDash(lunchPercent)} ${circumference}`}
              strokeDashoffset={-toStrokeDash(breakfastEnd)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          )}

          {/* Dinner Segment */}
          {dinner > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={mealColors.dinner}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${toStrokeDash(dinnerPercent)} ${circumference}`}
              strokeDashoffset={-toStrokeDash(lunchEnd)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          )}

          {/* Snacks Segment */}
          {snacks > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={mealColors.snacks}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${toStrokeDash(snacksPercent)} ${circumference}`}
              strokeDashoffset={-toStrokeDash(dinnerEnd)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          )}
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-white mb-1">{consumed}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Consumed</div>
          <div className="text-sm text-gray-400">
            <span className="text-[#00D1FF] font-semibold">{remaining}</span> remaining
          </div>
          <div className="text-xs text-gray-600 mt-1">of {totalCalories} cal</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-xs">
        {breakfast > 0 && (
          <div className="flex items-center space-x-2 px-3 py-2 bg-white/5 rounded-lg">
            <Coffee className="w-4 h-4" style={{ color: mealColors.breakfast }} />
            <div className="flex-1">
              <div className="text-xs text-gray-400">Breakfast</div>
              <div className="text-sm font-semibold text-white">{breakfast} cal</div>
            </div>
          </div>
        )}

        {lunch > 0 && (
          <div className="flex items-center space-x-2 px-3 py-2 bg-white/5 rounded-lg">
            <Sun className="w-4 h-4" style={{ color: mealColors.lunch }} />
            <div className="flex-1">
              <div className="text-xs text-gray-400">Lunch</div>
              <div className="text-sm font-semibold text-white">{lunch} cal</div>
            </div>
          </div>
        )}

        {dinner > 0 && (
          <div className="flex items-center space-x-2 px-3 py-2 bg-white/5 rounded-lg">
            <Moon className="w-4 h-4" style={{ color: mealColors.dinner }} />
            <div className="flex-1">
              <div className="text-xs text-gray-400">Dinner</div>
              <div className="text-sm font-semibold text-white">{dinner} cal</div>
            </div>
          </div>
        )}

        {snacks > 0 && (
          <div className="flex items-center space-x-2 px-3 py-2 bg-white/5 rounded-lg">
            <Cookie className="w-4 h-4" style={{ color: mealColors.snacks }} />
            <div className="flex-1">
              <div className="text-xs text-gray-400">Snacks</div>
              <div className="text-sm font-semibold text-white">{snacks} cal</div>
            </div>
          </div>
        )}
      </div>

      {/* Status Badge */}
      {consumed >= totalCalories && (
        <div className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full">
          <span className="text-red-400 font-semibold text-sm">⚠ Target Reached</span>
        </div>
      )}

      {consumed > 0 && consumed < totalCalories * 0.5 && (
        <div className="mt-4 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
          <span className="text-green-400 font-semibold text-sm">✓ On Track</span>
        </div>
      )}
    </div>
  );
};

export default CalorieRing;
