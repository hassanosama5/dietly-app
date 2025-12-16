require("dotenv").config();
const mongoose = require("mongoose");

// Import your Express app from src/app.js
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
}

// Ensure a database name is present in the connection string
const defaultDbName = process.env.DB_NAME || "dietly";
const hasExplicitDb = /mongodb\.net\/[^?]+\?/.test(DB);
if (!hasExplicitDb) {
  DB = DB.replace("mongodb.net/?", `mongodb.net/${defaultDbName}?`);
}

// Connection options
const connectionOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

mongoose
  .connect(DB, connectionOptions)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });