// seedMeals-manual.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Meal = require("../models/Meal");
const User = require("../models/User");

dotenv.config();

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

const connectDB = async () => {
  try {
    await mongoose.connect(DB);
    console.log("✅ MongoDB Connected for manual meal seeding");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// Fixed manual meal data that matches your EXACT model enums
const manualMeals = [
  // BREAKFAST MEALS
  {
    name: "Classic Oatmeal with Berries",
    description:
      "Hearty oatmeal topped with fresh mixed berries and a drizzle of honey",
    mealType: "breakfast",
    imageUrl:
      "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500&h=500&fit=crop",
    prepTime: 5,
    cookTime: 10,
    servings: 1,
    ingredients: [
      { name: "Rolled oats", amount: 50, unit: "g", allergens: [] },
      { name: "Mixed berries", amount: 100, unit: "g", allergens: [] },
      { name: "Honey", amount: 15, unit: "ml", allergens: [] },
      { name: "Almond milk", amount: 200, unit: "ml", allergens: ["nuts"] },
    ],
    instructions: [
      "Bring almond milk to a gentle boil",
      "Add rolled oats and reduce heat",
      "Simmer for 5-7 minutes, stirring occasionally",
      "Top with mixed berries and drizzle with honey",
    ],
    nutrition: {
      calories: 320,
      protein: 12,
      carbohydrates: 58,
      fats: 6,
      fiber: 8,
      sugar: 22,
      sodium: 85,
    },
    dietaryTags: ["vegetarian", "gluten-free"],
    allergens: ["nuts"],
    difficulty: "easy",
    averageRating: 4,
    isActive: true,
  },
  {
    name: "Avocado Toast with Eggs",
    description: "Whole grain toast with mashed avocado and sunny-side up eggs",
    mealType: "breakfast",
    imageUrl:
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&h=500&fit=crop",
    prepTime: 10,
    cookTime: 10,
    servings: 2,
    ingredients: [
      {
        name: "Whole grain bread",
        amount: 2,
        unit: "piece",
        allergens: ["gluten", "wheat"],
      }, // Changed "slice" to "piece"
      { name: "Avocado", amount: 1, unit: "piece", allergens: [] },
      { name: "Eggs", amount: 2, unit: "piece", allergens: ["eggs"] },
      { name: "Lemon juice", amount: 10, unit: "ml", allergens: [] },
    ],
    instructions: [
      "Toast bread slices until golden brown",
      "Mash avocado with lemon juice and season",
      "Fry eggs sunny-side up",
      "Spread avocado on toast and top with eggs",
    ],
    nutrition: {
      calories: 380,
      protein: 18,
      carbohydrates: 28,
      fats: 24,
      fiber: 9,
      sugar: 3,
      sodium: 320,
    },
    dietaryTags: ["vegetarian", "high-protein"],
    allergens: ["gluten", "eggs"], // Removed "wheat" since it's not in your enum
    difficulty: "easy",
    averageRating: 4,
    isActive: true,
  },

  // LUNCH MEALS
  {
    name: "Mediterranean Quinoa Bowl",
    description:
      "Protein-packed quinoa bowl with fresh vegetables and feta cheese",
    mealType: "lunch",
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop",
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    ingredients: [
      { name: "Quinoa", amount: 150, unit: "g", allergens: [] },
      { name: "Cherry tomatoes", amount: 100, unit: "g", allergens: [] },
      { name: "Cucumber", amount: 1, unit: "piece", allergens: [] },
      { name: "Feta cheese", amount: 50, unit: "g", allergens: ["dairy"] },
      { name: "Olive oil", amount: 15, unit: "ml", allergens: [] },
    ],
    instructions: [
      "Cook quinoa according to package instructions",
      "Dice vegetables and chop herbs",
      "Combine all ingredients in a large bowl",
      "Drizzle with olive oil and lemon juice",
    ],
    nutrition: {
      calories: 420,
      protein: 15,
      carbohydrates: 65,
      fats: 12,
      fiber: 8,
      sugar: 6,
      sodium: 280,
    },
    dietaryTags: ["vegetarian", "gluten-free"],
    allergens: ["dairy"],
    difficulty: "easy",
    averageRating: 4,
    isActive: true,
  },
  {
    name: "Chicken Caesar Salad",
    description:
      "Classic Caesar salad with grilled chicken breast and parmesan",
    mealType: "lunch",
    imageUrl:
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&h=500&fit=crop",
    prepTime: 15,
    cookTime: 15,
    servings: 2,
    ingredients: [
      { name: "Chicken breast", amount: 200, unit: "g", allergens: [] },
      { name: "Romaine lettuce", amount: 200, unit: "g", allergens: [] },
      { name: "Parmesan cheese", amount: 30, unit: "g", allergens: ["dairy"] },
      { name: "Croutons", amount: 50, unit: "g", allergens: ["gluten"] }, // Removed "wheat"
      {
        name: "Caesar dressing",
        amount: 30,
        unit: "ml",
        allergens: ["dairy", "eggs"],
      },
    ],
    instructions: [
      "Grill chicken breast until cooked through",
      "Chop lettuce and prepare vegetables",
      "Slice chicken and arrange on salad",
      "Top with croutons and parmesan",
    ],
    nutrition: {
      calories: 380,
      protein: 35,
      carbohydrates: 15,
      fats: 22,
      fiber: 4,
      sugar: 3,
      sodium: 650,
    },
    dietaryTags: ["high-protein", "low-carb"],
    allergens: ["dairy", "eggs", "gluten"], // Removed "wheat"
    difficulty: "easy",
    averageRating: 4,
    isActive: true,
  },

  // DINNER MEALS
  {
    name: "Grilled Salmon with Asparagus",
    description: "Omega-3 rich salmon with roasted asparagus and lemon",
    mealType: "dinner",
    imageUrl:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&h=500&fit=crop",
    prepTime: 10,
    cookTime: 20,
    servings: 2,
    ingredients: [
      { name: "Salmon fillet", amount: 300, unit: "g", allergens: ["fish"] },
      { name: "Asparagus", amount: 200, unit: "g", allergens: [] },
      { name: "Olive oil", amount: 20, unit: "ml", allergens: [] },
      { name: "Lemon", amount: 1, unit: "piece", allergens: [] },
    ],
    instructions: [
      "Season salmon with salt and pepper",
      "Roast asparagus with olive oil",
      "Grill salmon for 4-5 minutes per side",
      "Serve with lemon wedges",
    ],
    nutrition: {
      calories: 450,
      protein: 40,
      carbohydrates: 8,
      fats: 28,
      fiber: 4,
      sugar: 3,
      sodium: 350,
    },
    dietaryTags: ["gluten-free", "high-protein", "low-carb"],
    allergens: ["fish"],
    difficulty: "medium",
    averageRating: 5,
    isActive: true,
  },
  {
    name: "Vegetable Stir Fry with Tofu",
    description: "Colorful vegetable stir fry with crispy tofu and soy sauce",
    mealType: "dinner",
    imageUrl:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&h=500&fit=crop",
    prepTime: 20,
    cookTime: 15,
    servings: 3,
    ingredients: [
      { name: "Firm tofu", amount: 300, unit: "g", allergens: ["soy"] },
      { name: "Broccoli", amount: 200, unit: "g", allergens: [] },
      { name: "Bell peppers", amount: 150, unit: "g", allergens: [] },
      { name: "Carrots", amount: 100, unit: "g", allergens: [] },
      { name: "Soy sauce", amount: 30, unit: "ml", allergens: ["soy"] },
    ],
    instructions: [
      "Press and cube tofu, then pan-fry until crispy",
      "Stir-fry vegetables until tender-crisp",
      "Add sauce and simmer for 2 minutes",
      "Combine with tofu and serve hot",
    ],
    nutrition: {
      calories: 320,
      protein: 22,
      carbohydrates: 25,
      fats: 14,
      fiber: 6,
      sugar: 8,
      sodium: 620,
    },
    dietaryTags: ["vegan", "high-protein"],
    allergens: ["soy"],
    difficulty: "medium",
    averageRating: 4,
    isActive: true,
  },

  // SNACK MEALS
  {
    name: "Greek Yogurt with Honey and Walnuts",
    description:
      "Protein-rich Greek yogurt with natural honey and crunchy walnuts",
    mealType: "snack",
    imageUrl:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&h=500&fit=crop",
    prepTime: 2,
    cookTime: 0,
    servings: 1,
    ingredients: [
      { name: "Greek yogurt", amount: 150, unit: "g", allergens: ["dairy"] },
      { name: "Walnuts", amount: 20, unit: "g", allergens: ["nuts"] },
      { name: "Honey", amount: 15, unit: "ml", allergens: [] },
    ],
    instructions: [
      "Scoop Greek yogurt into a bowl",
      "Top with walnuts",
      "Drizzle with honey and serve",
    ],
    nutrition: {
      calories: 210,
      protein: 18,
      carbohydrates: 15,
      fats: 9,
      fiber: 1,
      sugar: 14,
      sodium: 65,
    },
    dietaryTags: ["high-protein"],
    allergens: ["dairy", "nuts"],
    difficulty: "easy",
    averageRating: 4,
    isActive: true,
  },
  {
    name: "Apple Slices with Almond Butter",
    description: "Crisp apple slices with creamy almond butter",
    mealType: "snack",
    imageUrl:
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=500&h=500&fit=crop",
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    ingredients: [
      { name: "Apple", amount: 1, unit: "piece", allergens: [] },
      { name: "Almond butter", amount: 30, unit: "g", allergens: ["nuts"] },
    ],
    instructions: [
      "Wash and slice apple",
      "Serve with almond butter for dipping",
      "Enjoy immediately",
    ],
    nutrition: {
      calories: 180,
      protein: 4,
      carbohydrates: 25,
      fats: 8,
      fiber: 5,
      sugar: 18,
      sodium: 5,
    },
    dietaryTags: ["vegetarian", "gluten-free"],
    allergens: ["nuts"],
    difficulty: "easy",
    averageRating: 4,
    isActive: true,
  },
];

const seedManualMeals = async () => {
  try {
    await connectDB();

    // Get admin user
    const adminUser = await User.findOne({ email: "admin@dietly.com" });
    if (!adminUser) {
      console.log("❌ Admin user not found. Please run user seeder first.");
      process.exit(1);
    }

    // Add createdBy to all meals
    const mealsWithCreator = manualMeals.map((meal) => ({
      ...meal,
      createdBy: adminUser._id,
    }));

    // Insert manual meals (continue on error)
    const createdMeals = await Meal.insertMany(mealsWithCreator, {
      ordered: false,
    });
    console.log(`✅ Created ${createdMeals.length} manual meals`);

    // Show distribution
    const stats = {};
    ["breakfast", "lunch", "dinner", "snack"].forEach((type) => {
      stats[type] = createdMeals.filter((m) => m.mealType === type).length;
    });

    console.log("\n📊 Manual Meal Distribution:");
    Object.entries(stats).forEach(([type, count]) => {
      console.log(
        `   ${type.charAt(0).toUpperCase() + type.slice(1)}: ${count} meals`
      );
    });

    console.log("\n✨ Manual meal seeding completed successfully!");
    console.log("🎉 You now have a good base of meals to work with!");

    process.exit(0);
  } catch (error) {
    if (error.writeErrors) {
      console.log(
        `⚠️  Some meals had validation errors, but ${error.insertedDocs.length} were inserted successfully`
      );
      console.log("✅ Partial success - you have meals to work with!");
    } else {
      console.error("❌ Manual Seeding Error:", error);
    }
    process.exit(1);
  }
};

seedManualMeals();
