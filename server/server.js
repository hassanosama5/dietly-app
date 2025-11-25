require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./src/app");

const PORT = process.env.PORT || 5000;

// Check if DATABASE is set
if (!process.env.DATABASE) {
  console.error("❌ DATABASE environment variable is not set!");
  process.exit(1);
}

// Build connection string
let DB = process.env.DATABASE;
if (DB && DB.includes("<PASSWORD>")) {
  if (!process.env.DATABASE_PASSWORD) {
    console.error("❌ DATABASE_PASSWORD is required when using <PASSWORD> placeholder!");
    process.exit(1);
  }
  DB = DB.replace("<PASSWORD>", encodeURIComponent(process.env.DATABASE_PASSWORD));
} else if (DB) {
  // If no <PASSWORD> placeholder, assume password is already in the string
  console.log("ℹ️  Using full connection string from DATABASE");
}

// Ensure a database name is present in the connection string
const defaultDbName = process.env.DB_NAME || "dietly";
const hasExplicitDb = /mongodb\.net\/[^?]+\?/.test(DB);
if (!hasExplicitDb) {
  DB = DB.replace("mongodb.net/?", `mongodb.net/${defaultDbName}?`);
}

// Debug: Show connection string (without password for security)
const dbForLog = DB.replace(/:[^:@]+@/, ":****@");
console.log("🔗 Connecting to:", dbForLog);

// Connection options
const connectionOptions = {
  serverSelectionTimeoutMS: 10000, // 10 seconds timeout
  socketTimeoutMS: 45000,
};

mongoose
  .connect(DB, connectionOptions)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:");
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    console.error("\n💡 Troubleshooting tips:");
    console.error("1. Check your DATABASE connection string in .env file");
    console.error("2. Verify MongoDB Atlas IP whitelist includes your IP (0.0.0.0/0 for all)");
    console.error("3. Check your internet connection");
    console.error("4. Verify DATABASE_PASSWORD in .env is correct");
    console.error("5. Make sure MongoDB Atlas cluster is running");
    console.error("6. Try using the exact connection string from MongoDB Compass");
    process.exit(1);
  });
