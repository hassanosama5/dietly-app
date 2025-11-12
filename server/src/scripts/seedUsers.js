const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected for seeding");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// Test users
const sampleUsers = [
  {
    name: "Admin User",
    email: "admin@dietly.com",
    password: "admin123",
    role: "admin",
    age: 30,
    gender: "male",
    height: 175,
    currentWeight: 75,
    targetWeight: 70,
    healthGoal: "lose",
    activityLevel: "moderate",
    dailyCalorieTarget: 2000,
    dietaryPreferences: [],
    allergies: [],
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "user",
    age: 28,
    gender: "male",
    height: 180,
    currentWeight: 85,
    targetWeight: 75,
    healthGoal: "lose",
    activityLevel: "light",
    dailyCalorieTarget: 1800,
    dietaryPreferences: [],
    allergies: ["nuts"],
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    role: "user",
    age: 25,
    gender: "female",
    height: 165,
    currentWeight: 60,
    targetWeight: 65,
    healthGoal: "gain",
    activityLevel: "active",
    dailyCalorieTarget: 2200,
    dietaryPreferences: ["vegetarian"],
    allergies: [],
  },
  {
    name: "Mike Johnson",
    email: "mike@example.com",
    password: "password123",
    role: "user",
    age: 35,
    gender: "male",
    height: 178,
    currentWeight: 80,
    targetWeight: 80,
    healthGoal: "maintain",
    activityLevel: "moderate",
    dailyCalorieTarget: 2100,
    dietaryPreferences: ["high-protein"],
    allergies: ["dairy"],
  },
  {
    name: "Sarah Williams",
    email: "sarah@example.com",
    password: "password123",
    role: "user",
    age: 32,
    gender: "female",
    height: 170,
    currentWeight: 68,
    targetWeight: 62,
    healthGoal: "lose",
    activityLevel: "very_active",
    dailyCalorieTarget: 1900,
    dietaryPreferences: ["vegan"],
    allergies: [],
  },
];

// Seed function
const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users (except those with progress or meal plans)
    await User.deleteMany({ email: { $in: sampleUsers.map((u) => u.email) } });
    console.log("🗑️  Cleared existing test users");

    // Insert sample users
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} test users`);

    console.log("\n👤 Test User Credentials:");
    console.log("─────────────────────────────────────────");
    console.log("Admin:");
    console.log("  Email: admin@dietly.com");
    console.log("  Password: admin123");
    console.log("");
    console.log("Regular Users:");
    sampleUsers
      .filter((u) => u.role === "user")
      .forEach((user) => {
        console.log(`  Email: ${user.email}`);
        console.log(`  Password: ${user.password}`);
        console.log(
          `  Goal: ${user.healthGoal} | Activity: ${user.activityLevel}`
        );
        console.log("");
      });

    console.log("\n✨ User seeding completed successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

// Run seeder
seedUsers();
