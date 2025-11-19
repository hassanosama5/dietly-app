// seedMeals-spoonacular-WORKING.js
// FIXED: Uses correct Spoonacular API parameters
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

// ==========================================
// CONFIG
// ==========================================
const CONFIG = {
  mealsPerType: {
    breakfast: 0, // Already have
    lunch: 100, // Want 100
    dinner: 100, // Want 100
    snack: 0, // Already have
  },
  clearExistingMeals: false,
  maxRetries: 2,
  delayBetweenRequests: 400,
  dryRun: false,
};

let apiCallsUsed = 0;

// ==========================================
// SPOONACULAR API TYPE MAPPING (THE FIX!)
// ==========================================
// Spoonacular's valid "type" parameters are:
// main course, side dish, dessert, appetizer, salad, bread,
// breakfast, soup, beverage, sauce, marinade, fingerfood,
// snack, drink

const SPOONACULAR_TYPES = {
  breakfast: ["breakfast"],
  lunch: ["salad", "soup", "appetizer", "main course"], // Light meals
  dinner: ["main course"], // Heavy main courses
  snack: ["snack", "fingerfood", "appetizer"],
};

// ==========================================
// CONNECT DB
// ==========================================
const connectDB = async () => {
  try {
    await mongoose.connect(DB);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ DB Error:", error.message);
    process.exit(1);
  }
};

// ==========================================
// HELPERS
// ==========================================
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const mapUnitToValidEnum = (unit) => {
  if (!unit) return "g";
  const map = {
    tablespoon: "tbsp",
    tablespoons: "tbsp",
    tbsp: "tbsp",
    teaspoon: "tsp",
    teaspoons: "tsp",
    tsp: "tsp",
    cup: "cup",
    cups: "cup",
    ounce: "oz",
    ounces: "oz",
    oz: "oz",
    pound: "lb",
    pounds: "lb",
    lb: "lb",
    milliliter: "ml",
    milliliters: "ml",
    ml: "ml",
    liter: "l",
    liters: "l",
    l: "l",
    gram: "g",
    grams: "g",
    g: "g",
    kilogram: "kg",
    kilograms: "kg",
    kg: "kg",
    piece: "piece",
    pieces: "piece",
    whole: "piece",
    medium: "piece",
    large: "piece",
    small: "piece",
  };
  return map[unit?.toLowerCase()] || "g";
};

// IMPROVED CLASSIFIER
const classifyMealType = (recipe, requestedType) => {
  const dishTypes = (recipe.dishTypes || []).map((d) => d.toLowerCase());
  const calories =
    recipe.nutrition?.nutrients?.find((n) => n.name === "Calories")?.amount ||
    400;

  // Priority 1: Check dish types
  if (dishTypes.includes("breakfast")) return "breakfast";
  if (dishTypes.includes("snack") || dishTypes.includes("fingerfood"))
    return "snack";

  // Priority 2: For lunch/dinner, use calories as a guide
  if (requestedType === "lunch") {
    // Lunch: lighter meals (salads, soups, sandwiches) or main courses under 600 cal
    if (dishTypes.some((d) => ["salad", "soup", "sandwich"].includes(d))) {
      return "lunch";
    }
    if (dishTypes.includes("main course") && calories < 600) {
      return "lunch";
    }
  }

  if (requestedType === "dinner") {
    // Dinner: main courses, preferably over 400 calories
    if (dishTypes.includes("main course")) {
      return "dinner";
    }
  }

  // Fallback to requested type
  return requestedType;
};

const mapDietaryTags = (recipe) => {
  const tags = [];
  if (recipe.vegetarian) tags.push("vegetarian");
  if (recipe.vegan) tags.push("vegan");
  if (recipe.glutenFree) tags.push("gluten-free");
  if (recipe.dairyFree) tags.push("dairy-free");

  const n = recipe.nutrition?.nutrients || [];
  const protein = n.find((x) => x.name === "Protein")?.amount || 0;
  const carbs = n.find((x) => x.name === "Carbohydrates")?.amount || 0;

  if (protein > 20) tags.push("high-protein");
  if (carbs < 25) tags.push("low-carb");

  return [...new Set(tags)];
};

const generateInstructions = (steps) => {
  if (steps?.length) return steps[0].steps.slice(0, 10).map((s) => s.step);
  return ["Prepare all ingredients", "Follow cooking steps", "Serve and enjoy"];
};

// ==========================================
// MAP RECIPE TO MEAL
// ==========================================
const mapRecipeToMeal = (recipe, adminId, requestedType) => {
  const nutrients = recipe.nutrition?.nutrients || [];
  const getNutrient = (name, def) =>
    Math.round(nutrients.find((n) => n.name === name)?.amount || def);

  return {
    name: recipe.title || "Delicious Meal",
    description: (recipe.summary || "A nutritious meal")
      .replace(/<[^>]*>/g, "")
      .trim()
      .slice(0, 490),
    mealType: classifyMealType(recipe, requestedType),
    imageUrl:
      recipe.image ||
      `https://spoonacular.com/recipeImages/${recipe.id}-556x370.jpg`,
    prepTime: recipe.preparationMinutes || 10,
    cookTime: recipe.cookingMinutes || 20,
    servings: recipe.servings || 4,
    ingredients: (recipe.extendedIngredients || []).slice(0, 15).map((i) => ({
      name: i.nameClean || i.name || "Ingredient",
      amount: Math.round((i.amount || 1) * 10) / 10,
      unit: mapUnitToValidEnum(i.unit),
      allergens: [],
    })),
    instructions: generateInstructions(recipe.analyzedInstructions),
    nutrition: {
      calories: Math.max(getNutrient("Calories", 350), 50),
      protein: Math.max(getNutrient("Protein", 15), 1),
      carbohydrates: Math.max(getNutrient("Carbohydrates", 35), 1),
      fats: Math.max(getNutrient("Fat", 12), 1),
      fiber: getNutrient("Fiber", 5),
      sugar: getNutrient("Sugar", 8),
      sodium: getNutrient("Sodium", 400),
    },
    dietaryTags: mapDietaryTags(recipe),
    allergens: [],
    difficulty: recipe.readyInMinutes <= 30 ? "easy" : "medium",
    averageRating: 4,
    isActive: true,
    createdBy: adminId,
  };
};

// ==========================================
// FETCH WITH RETRY
// ==========================================
const fetchWithRetry = async (url, params) => {
  for (let i = 0; i <= CONFIG.maxRetries; i++) {
    try {
      apiCallsUsed++;
      const res = await axios.get(url, { params, timeout: 15000 });
      return res.data;
    } catch (err) {
      if (err.response?.status === 402) {
        console.error("\n❌ API QUOTA EXCEEDED");
        console.log("   Your daily limit has been reached");
        console.log("   Wait 24 hours or upgrade your plan");
        return null;
      }
      if (i === CONFIG.maxRetries) {
        console.error(`   ❌ Failed after ${CONFIG.maxRetries + 1} attempts`);
        return null;
      }
      console.log(`   ⚠️ Retry ${i + 1}/${CONFIG.maxRetries}...`);
      await delay(2000);
    }
  }
  return null;
};

// ==========================================
// FETCH ALL RECIPES FOR A MEAL TYPE
// ==========================================
const fetchAllRecipes = async (mealType, target) => {
  console.log(`\n📡 Fetching ${target} ${mealType} recipes...`);

  const allRecipes = [];
  const types = SPOONACULAR_TYPES[mealType];

  if (!types || types.length === 0) {
    console.log(`   ⚠️ No API types configured for ${mealType}`);
    return [];
  }

  for (const dishType of types) {
    if (allRecipes.length >= target) break;

    console.log(`   → Querying type: "${dishType}"`);

    let offset = 0;
    const pageSize = 50;
    let attempts = 0;
    const maxAttempts = Math.ceil((target - allRecipes.length) / pageSize) + 2;

    while (allRecipes.length < target && attempts < maxAttempts) {
      const params = {
        apiKey: SPOONACULAR_API_KEY,
        type: dishType, // USE THE CORRECT DISH TYPE
        number: pageSize,
        offset: offset,
        addRecipeInformation: true,
        addRecipeNutrition: true,
        instructionsRequired: true,
        sort: "popularity",
      };

      console.log(`      Page ${attempts + 1}: offset ${offset}`);

      const data = await fetchWithRetry(
        `${SPOONACULAR_BASE_URL}/complexSearch`,
        params
      );

      if (!data) {
        console.log(`      ⚠️ API call failed, stopping`);
        break;
      }

      if (!data.results || data.results.length === 0) {
        console.log(`      ⚠️ No more results for "${dishType}"`);
        break;
      }

      console.log(`      ✅ Got ${data.results.length} recipes`);
      allRecipes.push(...data.results);

      offset += pageSize;
      attempts++;

      // Delay between pages
      if (allRecipes.length < target && attempts < maxAttempts) {
        console.log(`      ⏳ Waiting ${CONFIG.delayBetweenRequests}ms...`);
        await delay(CONFIG.delayBetweenRequests);
      }
    }

    console.log(`   📊 Total from "${dishType}": ${allRecipes.length} recipes`);

    // Delay between different dish types
    if (
      allRecipes.length < target &&
      types.indexOf(dishType) < types.length - 1
    ) {
      await delay(CONFIG.delayBetweenRequests);
    }
  }

  // Remove duplicates by recipe ID
  const uniqueRecipes = Array.from(
    new Map(allRecipes.map((r) => [r.id, r])).values()
  );

  console.log(`   ✅ Total unique recipes fetched: ${uniqueRecipes.length}`);
  return uniqueRecipes.slice(0, target);
};

// ==========================================
// MAIN SEEDER
// ==========================================
const seedMeals = async () => {
  console.log("\n🚀 Spoonacular Meal Seeder - FIXED VERSION");
  console.log("==========================================");

  if (!SPOONACULAR_API_KEY) {
    console.error("❌ Missing SPOONACULAR_API_KEY in .env");
    process.exit(1);
  }

  const totalTarget = Object.values(CONFIG.mealsPerType).reduce(
    (a, b) => a + b,
    0
  );
  console.log(`\n📊 Target: ${totalTarget} meals`);
  console.log(`   Lunch: ${CONFIG.mealsPerType.lunch}`);
  console.log(`   Dinner: ${CONFIG.mealsPerType.dinner}`);
  console.log(`   Clear existing: ${CONFIG.clearExistingMeals}`);
  console.log(`   Dry run: ${CONFIG.dryRun}`);
  console.log("==========================================\n");

  if (CONFIG.dryRun) {
    console.log("✅ DRY RUN - No API calls will be made");
    process.exit(0);
  }

  // Connect
  await connectDB();

  // Get admin
  const admin = await User.findOne({ email: "admin@dietly.com" });
  if (!admin) {
    console.error("❌ Admin user not found");
    process.exit(1);
  }

  // Clear if needed
  if (CONFIG.clearExistingMeals) {
    const count = await Meal.countDocuments();
    console.log(`🗑️ Clearing ${count} existing meals...`);
    await Meal.deleteMany({});
  } else {
    const count = await Meal.countDocuments();
    console.log(`📝 Keeping ${count} existing meals\n`);
  }

  // Fetch meals
  const allMeals = [];
  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

  for (const mealType of mealTypes) {
    const target = CONFIG.mealsPerType[mealType];
    if (target === 0) {
      console.log(`⏭️ Skipping ${mealType}`);
      continue;
    }

    const recipes = await fetchAllRecipes(mealType, target);

    if (recipes.length === 0) {
      console.log(`   ⚠️ No recipes fetched for ${mealType}\n`);
      continue;
    }

    // Map to meal schema
    let mapped = 0;
    for (const recipe of recipes) {
      try {
        const meal = mapRecipeToMeal(recipe, admin._id, mealType);

        // Verify meal type matches
        if (meal.mealType === mealType) {
          allMeals.push(meal);
          mapped++;
        } else {
          console.log(
            `   ⚠️ Skipped: ${recipe.title} (classified as ${meal.mealType}, wanted ${mealType})`
          );
        }
      } catch (error) {
        console.error(`   ❌ Error mapping recipe: ${error.message}`);
      }
    }

    console.log(`   ✅ Mapped ${mapped} ${mealType} meals\n`);
  }

  // Insert
  if (allMeals.length === 0) {
    console.log("❌ No meals to insert");
    process.exit(1);
  }

  console.log(`\n💾 Inserting ${allMeals.length} meals into database...`);

  try {
    const inserted = await Meal.insertMany(allMeals, { ordered: false });
    console.log(`✅ Successfully inserted ${inserted.length} meals`);

    // Statistics
    const stats = {};
    for (const meal of inserted) {
      stats[meal.mealType] = (stats[meal.mealType] || 0) + 1;
    }

    console.log("\n📊 Final Statistics:");
    console.log("==========================================");
    Object.entries(stats).forEach(([type, count]) => {
      console.log(
        `   ${type.charAt(0).toUpperCase() + type.slice(1)}: ${count} meals`
      );
    });

    const totalInDb = await Meal.countDocuments();
    console.log(`   Total in database: ${totalInDb} meals`);
    console.log("==========================================");
    console.log(`🔑 API calls used this run: ${apiCallsUsed}`);
  } catch (error) {
    console.error("\n❌ Insert Error:", error.message);
    if (error.insertedDocs) {
      console.log(
        `⚠️ ${error.insertedDocs.length} meals inserted despite errors`
      );
    }
  }

  console.log("\n✨ Seeding completed!");
  process.exit(0);
};

// Run
seedMeals().catch((err) => {
  console.error("❌ Fatal Error:", err);
  process.exit(1);
});
