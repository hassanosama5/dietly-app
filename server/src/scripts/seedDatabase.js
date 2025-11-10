const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const Meal = require("../models/Meal");
const User = require("../models/User");
const { sampleMeals } = require("./mealData");
const { sampleUsers } = require("./userData");

dotenv.config();

class DatabaseSeeder {
  constructor() {
    this.connected = false;
  }

  async connect() {
    try {
      const conn = await mongoose.connect(
        process.env.MONGO_URI || "mongodb://localhost:27017/dietly"
      );
      this.connected = true;
      console.log("✅ MongoDB Connected successfully");
      return conn;
    } catch (error) {
      console.error("❌ Database connection failed:", error.message);
      process.exit(1);
    }
  }

  async clearCollections() {
    console.log("🧹 Clearing existing data...");

    const collections = mongoose.connection.collections;

    try {
      await Meal.deleteMany({});
      console.log("✅ Meals collection cleared");

      await User.deleteMany({});
      console.log("✅ Users collection cleared");
    } catch (error) {
      console.log("ℹ️ Collections already empty or not created");
    }
  }

  async hashUserPasswords(users) {
    console.log("🔐 Hashing user passwords...");

    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    return hashedUsers;
  }

  async seedMeals() {
    console.log("🍽️ Seeding meals...");

    try {
      const mealsWithTimestamps = sampleMeals.map((meal) => ({
        ...meal,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const result = await Meal.insertMany(mealsWithTimestamps);
      console.log(`✅ ${result.length} meals seeded successfully`);
      return result;
    } catch (error) {
      console.error("❌ Error seeding meals:", error.message);
      throw error;
    }
  }

  async seedUsers() {
    console.log("👥 Seeding users...");

    try {
      const hashedUsers = await this.hashUserPasswords(sampleUsers);
      const usersWithTimestamps = hashedUsers.map((user) => ({
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const result = await User.insertMany(usersWithTimestamps);
      console.log(`✅ ${result.length} users seeded successfully`);
      return result;
    } catch (error) {
      console.error("❌ Error seeding users:", error.message);
      throw error;
    }
  }

  async generateStatistics() {
    console.log("\n📊 Generating database statistics...");

    const totalMeals = await Meal.countDocuments();
    const totalUsers = await User.countDocuments();

    const mealsByType = await Meal.aggregate([
      { $group: { _id: "$mealType", count: { $sum: 1 } } },
    ]);

    const usersByGoal = await User.aggregate([
      { $group: { _id: "$healthGoal", count: { $sum: 1 } } },
    ]);

    console.log("=== DATABASE STATISTICS ===");
    console.log(`Total Meals: ${totalMeals}`);
    console.log(`Total Users: ${totalUsers}`);

    console.log("\n📈 Meals by Type:");
    mealsByType.forEach((type) => {
      console.log(`  ${type._id}: ${type.count} meals`);
    });

    console.log("\n🎯 Users by Health Goal:");
    usersByGoal.forEach((goal) => {
      console.log(`  ${goal._id}: ${goal.count} users`);
    });

    console.log("\n🏷️ Dietary Tags Summary:");
    const allMeals = await Meal.find({});
    const tagCount = {};
    allMeals.forEach((meal) => {
      meal.dietaryTags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([tag, count]) => {
        console.log(`  ${tag}: ${count} meals`);
      });
  }

  async seed() {
    try {
      console.log("🚀 Starting Dietly Database Seeding...\n");

      await this.connect();
      await this.clearCollections();

      // Seed in order to maintain relationships
      const meals = await this.seedMeals();
      const users = await this.seedUsers();

      await this.generateStatistics();

      console.log("\n🎉 Database seeding completed successfully!");
      console.log("📖 Your Dietly app is now ready with realistic data.");
    } catch (error) {
      console.error("💥 Seeding failed:", error.message);
      process.exit(1);
    } finally {
      mongoose.connection.close();
      console.log("🔒 Database connection closed");
    }
  }
}

// Run if called directly
if (require.main === module) {
  const seeder = new DatabaseSeeder();
  seeder.seed();
}

module.exports = DatabaseSeeder;
