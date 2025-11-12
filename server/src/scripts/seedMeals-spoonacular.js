// seedMeals-spoonacular.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const axios = require("axios");
const Meal = require("../models/Meal");
const User = require("../models/User");

dotenv.config();

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = "https://api.spoonacular.com/recipes";

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

const connectDB = async () => {
  try {
    await mongoose.connect(DB);
    console.log("✅ MongoDB Connected for Spoonacular seeding");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// Unit mapping from Spoonacular to your model
const mapUnitToValidEnum = (unit) => {
  if (!unit) return "g";

  const unitMap = {
    // Volume units
    tablespoons: "tbsp",
    tablespoon: "tbsp",
    tbsp: "tbsp",
    teaspoons: "tsp",
    teaspoon: "tsp",
    tsp: "tsp",
    cups: "cup",
    cup: "cup",
    ounces: "oz",
    ounce: "oz",
    oz: "oz",
    pounds: "lb",
    pound: "lb",
    lb: "lb",
    milliliters: "ml",
    milliliter: "ml",
    ml: "ml",
    liters: "l",
    liter: "l",
    l: "l",

    // Weight units
    grams: "g",
    gram: "g",
    g: "g",
    kilograms: "kg",
    kilogram: "kg",
    kg: "kg",

    // Count units
    pieces: "piece",
    piece: "piece",
    whole: "piece",
    medium: "piece",
    large: "piece",
    small: "piece",
  };

  const normalizedUnit = unit.toLowerCase().trim();
  return unitMap[normalizedUnit] || "g"; // Default to grams
};

// Helper mapping functions
const mapDishTypeToMealType = (dishTypes) => {
  if (!dishTypes || dishTypes.length === 0) return "lunch";

  const types = dishTypes.map((type) => type.toLowerCase());

  if (types.some((t) => t.includes("breakfast") || t.includes("morning")))
    return "breakfast";
  if (types.some((t) => t.includes("lunch") || t.includes("brunch")))
    return "lunch";
  if (
    types.some(
      (t) =>
        t.includes("dinner") ||
        t.includes("main course") ||
        t.includes("supper")
    )
  )
    return "dinner";
  if (
    types.some(
      (t) =>
        t.includes("snack") ||
        t.includes("appetizer") ||
        t.includes("fingerfood")
    )
  )
    return "snack";

  return "lunch";
};

const mapDietaryTags = (recipe) => {
  const tags = [];
  if (recipe.vegetarian) tags.push("vegetarian");
  if (recipe.vegan) tags.push("vegan");
  if (recipe.glutenFree) tags.push("gluten-free");
  if (recipe.dairyFree) tags.push("dairy-free");

  // Add nutrition-based tags
  const nutrition = recipe.nutrition?.nutrients || [];
  const protein = nutrition.find((n) => n.name === "Protein")?.amount || 0;
  const carbs = nutrition.find((n) => n.name === "Carbohydrates")?.amount || 0;

  if (protein > 20) tags.push("high-protein");
  if (carbs < 30) tags.push("low-carb");
  if (recipe.healthScore > 80) tags.push("healthy");

  // Remove duplicates
  return [...new Set(tags)];
};

const mapAllergens = (recipe) => {
  const allergens = [];

  // Map from recipe flags
  if (!recipe.dairyFree) allergens.push("dairy");
  if (!recipe.glutenFree) {
    allergens.push("gluten");
    allergens.push("wheat");
  }

  // Check ingredients for common allergens
  const ingredients = recipe.extendedIngredients || [];
  const ingredientText = ingredients
    .map((ing) => `${ing.name || ""} ${ing.original || ""}`.toLowerCase())
    .join(" ");

  if (
    ingredientText.includes("nut") ||
    ingredientText.includes("almond") ||
    ingredientText.includes("walnut") ||
    ingredientText.includes("pecan")
  ) {
    allergens.push("nuts");
  }
  if (ingredientText.includes("peanut")) allergens.push("peanuts");
  if (ingredientText.includes("egg")) allergens.push("eggs");
  if (ingredientText.includes("soy") || ingredientText.includes("tofu"))
    allergens.push("soy");
  if (
    ingredientText.includes("fish") ||
    ingredientText.includes("salmon") ||
    ingredientText.includes("tuna")
  )
    allergens.push("fish");
  if (
    ingredientText.includes("shrimp") ||
    ingredientText.includes("crab") ||
    ingredientText.includes("lobster") ||
    ingredientText.includes("prawn")
  ) {
    allergens.push("shellfish");
  }

  return [...new Set(allergens)];
};

const mapDifficulty = (readyInMinutes) => {
  if (!readyInMinutes) return "medium";
  if (readyInMinutes <= 15) return "easy";
  if (readyInMinutes <= 45) return "medium";
  return "hard";
};

const generateInstructions = (analyzedInstructions) => {
  if (analyzedInstructions && analyzedInstructions.length > 0) {
    return analyzedInstructions[0].steps.map((step) => step.step);
  }

  // Fallback instructions
  return [
    "Prepare all ingredients as listed",
    "Follow cooking instructions based on ingredient types",
    "Cook until desired doneness",
    "Serve immediately and enjoy",
  ];
};

// Map Spoonacular data to your Meal model
const mapSpoonacularToMeal = (spoonacularRecipe, createdBy) => {
  // Ensure we have valid nutrition data
  const nutrition = spoonacularRecipe.nutrition?.nutrients || [];

  // Map ingredients with valid units
  const mappedIngredients = (spoonacularRecipe.extendedIngredients || []).map(
    (ing) => ({
      name: ing.nameClean || ing.name || "Ingredient",
      amount: ing.amount || 1,
      unit: mapUnitToValidEnum(ing.unit),
      allergens: [], // We handle allergens at the recipe level
    })
  );

  // Get nutrition values with fallbacks
  const calories = nutrition.find((n) => n.name === "Calories")?.amount || 300;
  const protein = nutrition.find((n) => n.name === "Protein")?.amount || 15;
  const carbs = nutrition.find((n) => n.name === "Carbohydrates")?.amount || 40;
  const fats = nutrition.find((n) => n.name === "Fat")?.amount || 10;

  return {
    name: spoonacularRecipe.title || "Delicious Meal",
    description:
      spoonacularRecipe.summary?.replace(/<[^>]*>/g, "").substring(0, 495) +
        "..." ||
      "A delicious and nutritious meal perfect for your dietary goals.",
    mealType: mapDishTypeToMealType(spoonacularRecipe.dishTypes),
    imageUrl:
      spoonacularRecipe.image ||
      `https://spoonacular.com/recipeImages/${spoonacularRecipe.id}-556x370.jpg`,
    prepTime: spoonacularRecipe.preparationMinutes || 10,
    cookTime: spoonacularRecipe.cookingMinutes || 20,
    servings: spoonacularRecipe.servings || 4,
    ingredients: mappedIngredients,
    instructions: generateInstructions(spoonacularRecipe.analyzedInstructions),
    nutrition: {
      calories: Math.max(calories, 50), // Ensure minimum calories
      protein: Math.max(protein, 1),
      carbohydrates: Math.max(carbs, 1),
      fats: Math.max(fats, 1),
      fiber: nutrition.find((n) => n.name === "Fiber")?.amount || 5,
      sugar: nutrition.find((n) => n.name === "Sugar")?.amount || 8,
      sodium: nutrition.find((n) => n.name === "Sodium")?.amount || 400,
    },
    dietaryTags: mapDietaryTags(spoonacularRecipe),
    allergens: mapAllergens(spoonacularRecipe),
    difficulty: mapDifficulty(spoonacularRecipe.readyInMinutes),
    averageRating: 3, // Set default rating to avoid validation error
    isActive: true,
    createdBy: createdBy,
  };
};

// Fetch recipes from Spoonacular
const fetchSpoonacularRecipes = async (mealType, count = 5) => {
  try {
    console.log(`📡 Fetching ${count} ${mealType} recipes from Spoonacular...`);

    const searchTerms = {
      breakfast: "breakfast",
      lunch: "lunch",
      dinner: "dinner",
      snack: "snack",
    };

    const params = {
      apiKey: SPOONACULAR_API_KEY,
      query: searchTerms[mealType],
      number: count,
      addRecipeInformation: true,
      fillIngredients: true,
      instructionsRequired: true,
      addRecipeNutrition: true,
    };

    const response = await axios.get(`${SPOONACULAR_BASE_URL}/complexSearch`, {
      params: params,
      timeout: 10000,
    });

    console.log(
      `✅ Found ${response.data.results?.length || 0} ${mealType} recipes`
    );
    return response.data.results || [];
  } catch (error) {
    console.error(`❌ Error fetching ${mealType} recipes:`, error.message);
    return [];
  }
};

// Get detailed recipe info
const fetchRecipeDetails = async (recipeId) => {
  try {
    const response = await axios.get(
      `${SPOONACULAR_BASE_URL}/${recipeId}/information`,
      {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          includeNutrition: true,
        },
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      `❌ Error fetching details for recipe ${recipeId}:`,
      error.message
    );
    return null;
  }
};

// Main seeding function
const seedMealsFromSpoonacular = async () => {
  try {
    await connectDB();

    // Get admin user
    const adminUser = await User.findOne({ email: "admin@dietly.com" });
    if (!adminUser) {
      console.log("❌ Admin user not found. Please run user seeder first.");
      process.exit(1);
    }

    // Clear existing meals
    await Meal.deleteMany({});
    console.log("🗑️  Cleared existing meals");

    const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
    const mealsPerType = 5; // Start with 5 each (20 total)
    let allMeals = [];
    let successfulFetches = 0;

    for (const mealType of mealTypes) {
      console.log(`\n🍽️  Processing ${mealType} meals...`);

      const recipes = await fetchSpoonacularRecipes(mealType, mealsPerType);

      if (recipes.length === 0) {
        console.log(`⚠️  No ${mealType} recipes found, skipping...`);
        continue;
      }

      // Get detailed info for each recipe
      for (const recipe of recipes) {
        try {
          const detailedRecipe = await fetchRecipeDetails(recipe.id);
          if (detailedRecipe) {
            const mealData = mapSpoonacularToMeal(
              detailedRecipe,
              adminUser._id
            );
            allMeals.push(mealData);
            successfulFetches++;
            console.log(`   ✅ Mapped: ${mealData.name}`);
          }

          // Rate limiting
          await new Promise((resolve) => setTimeout(resolve, 300));
        } catch (error) {
          console.error(
            `❌ Error processing recipe ${recipe.id}:`,
            error.message
          );
        }
      }

      console.log(`✅ Processed ${recipes.length} ${mealType} recipes`);
    }

    if (allMeals.length === 0) {
      console.log(
        "❌ No meals were successfully fetched. Check your API key and connection."
      );
      process.exit(1);
    }

    // Insert all meals
    console.log("\n💾 Inserting meals into database...");
    const createdMeals = await Meal.insertMany(allMeals, { ordered: false }); // Continue on validation errors
    console.log(`✅ Created ${createdMeals.length} meals total`);

    // Show statistics
    const stats = {};
    mealTypes.forEach((type) => {
      stats[type] = createdMeals.filter((m) => m.mealType === type).length;
    });

    console.log("\n📊 Final Meal Distribution:");
    Object.entries(stats).forEach(([type, count]) => {
      console.log(
        `   ${type.charAt(0).toUpperCase() + type.slice(1)}: ${count} meals`
      );
    });

    console.log("\n✨ Spoonacular seeding completed successfully!");
    console.log(`🔑 API requests used: ~${successfulFetches * 2}`);
    console.log(`💡 Tip: You can increase 'mealsPerType' to get more meals`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Spoonacular Seeding Error:", error);
    if (error.writeErrors) {
      console.log(
        "⚠️  Some meals had validation errors but others were inserted successfully"
      );
    }
    process.exit(1);
  }
};

// Run seeder
seedMealsFromSpoonacular();
