import React from "react";
import { useNavigate } from "react-router-dom";

const MealPlanDay = ({
  day,
  onMealConsumed,
  showDate = true,
  allowConsume = true,
}) => {
  const navigate = useNavigate();

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayDate = new Date(d);
    dayDate.setHours(0, 0, 0, 0);

    const isToday = dayDate.getTime() === today.getTime();
    const isPast = dayDate < today;

    return {
      dateString: d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
      isToday,
      isPast,
    };
  };

  const dateInfo = showDate && day.date ? formatDate(day.date) : null;

  const handleMealClick = (meal) => {
    navigate(`/meals/${meal._id}`);
  };

  const handleConsumeToggle = (mealType, snackIndex = null) => {
    if (onMealConsumed) {
      onMealConsumed(day.date, mealType, snackIndex);
    }
  };

  const calculateDayNutrition = () => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fats = 0;

    const addNutrition = (mealEntry) => {
      if (mealEntry?.meal?.nutrition) {
        const servings = mealEntry.servings || 1;
        calories += mealEntry.meal.nutrition.calories * servings;
        protein += mealEntry.meal.nutrition.protein * servings;
        carbs += mealEntry.meal.nutrition.carbohydrates * servings;
        fats += mealEntry.meal.nutrition.fats * servings;
      }
    };

    if (day.meals?.breakfast) addNutrition(day.meals.breakfast);
    if (day.meals?.lunch) addNutrition(day.meals.lunch);
    if (day.meals?.dinner) addNutrition(day.meals.dinner);
    if (day.meals?.snacks) {
      day.meals.snacks.forEach((snack) => addNutrition(snack));
    }

    return { calories, protein, carbs, fats };
  };

  const nutrition = calculateDayNutrition();

  const renderMealEntry = (mealEntry, mealType, snackIndex = null) => {
    if (!mealEntry || !mealEntry.meal) {
      return (
        <div className="p-4 rounded-lg text-center text-gray-400 bg-gray-50">
          No {mealType} selected
        </div>
      );
    }

    const isConsumed = mealEntry.consumed || false;
    const servings = mealEntry.servings || 1;
    const meal = mealEntry.meal;

    return (
      <div
        onClick={() => handleMealClick(meal)}
        className={`relative rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer ${
          allowConsume ? "" : "opacity-60"
        }`}
      >
        {/* Consumed Badge */}
        {isConsumed && (
          <div className="absolute top-2 right-2 z-10 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            ✓ Consumed
          </div>
        )}

        {/* Compact horizontal meal layout */}
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-32 h-32 bg-gray-100 overflow-hidden flex-shrink-0">
            {meal.imageUrl ? (
              <img
                src={meal.imageUrl}
                alt={meal.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                🍽️
              </div>
            )}
          </div>

          <div className="flex-1 p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                  {meal.name}
                </h4>
                {meal.mealType && (
                  <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">
                    {meal.mealType.charAt(0).toUpperCase() +
                      meal.mealType.slice(1)}
                  </span>
                )}
              </div>
              {meal.description && (
                <p className="text-xs text-gray-600 line-clamp-2">
                  {meal.description}
                </p>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              {meal.nutrition && (
                <span>{meal.nutrition.calories} kcal</span>
              )}
              <span>
                <span className="font-medium">{servings}</span> serving
                {servings !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Consume Button */}
        <div className="px-3 pb-3 pt-1 flex justify-end">
          {allowConsume ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleConsumeToggle(mealType, snackIndex);
              }}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                isConsumed
                  ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {isConsumed ? "Mark as Not Consumed" : "Mark as Consumed"}
            </button>
          ) : (
            <button
              disabled
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium bg-gray-200 text-gray-600"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden font-poppins">
      {/* Day Header */}
      {dateInfo && (
        <div className={`px-6 py-4 ${dateInfo.isToday ? "bg-blue-50" : ""}`}>
          <div className="flex items-center justify-between">
            <h3
              className={`text-xl font-semibold ${
                dateInfo.isToday ? "text-blue-900" : "text-gray-900"
              }`}
            >
              {dateInfo.dateString}
              {dateInfo.isToday && (
                <span className="ml-2 text-sm font-normal text-blue-600">
                  (Today)
                </span>
              )}
            </h3>
            {dateInfo.isPast && !dateInfo.isToday && (
              <span className="text-sm text-gray-500">Past</span>
            )}
          </div>
        </div>
      )}

      {/* Meals Section */}
      <div className="p-6 space-y-6">
        {/* Breakfast */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Breakfast
          </h4>
          {renderMealEntry(day.meals?.breakfast, "breakfast")}
        </div>

        {/* Lunch */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Lunch</h4>
          {renderMealEntry(day.meals?.lunch, "lunch")}
        </div>

        {/* Dinner */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Dinner</h4>
          {renderMealEntry(day.meals?.dinner, "dinner")}
        </div>

        {/* Snacks */}
        {day.meals?.snacks && day.meals.snacks.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Snacks</h4>
            <div className="space-y-4">
              {day.meals.snacks.map((snack, index) => (
                <div key={index}>{renderMealEntry(snack, "snack", index)}</div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Nutrition Summary */}
        <div className="pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Daily Nutrition Summary
          </h4>
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-lg text-center bg-blue-50">
              <div className="text-xs text-gray-600 mb-1">Calories</div>
              <div className="text-lg font-bold text-blue-600">
                {Math.round(nutrition.calories)}
              </div>
            </div>
            <div className="p-3 rounded-lg text-center bg-green-50">
              <div className="text-xs text-gray-600 mb-1">Protein</div>
              <div className="text-lg font-bold text-green-600">
                {Math.round(nutrition.protein)}g
              </div>
            </div>
            <div className="p-3 rounded-lg text-center bg-yellow-50">
              <div className="text-xs text-gray-600 mb-1">Carbs</div>
              <div className="text-lg font-bold text-yellow-600">
                {Math.round(nutrition.carbs)}g
              </div>
            </div>
            <div className="p-3 rounded-lg text-center bg-purple-50">
              <div className="text-xs text-gray-600 mb-1">Fats</div>
              <div className="text-lg font-bold text-purple-600">
                {Math.round(nutrition.fats)}g
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {day.notes && (
          <div className="pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {day.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanDay;
