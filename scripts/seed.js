/**
 * Seed admin and support users. Run: node scripts/seed.js
 * Requires MONGODB_URI in .env.local
 */
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["admin", "support", "employee"], default: "employee" },
    department: String,
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Set MONGODB_URI in .env.local");
    process.exit(1);
  }
  await mongoose.connect(uri);
  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  const users = [
    {
      name: "Admin User",
      email: "admin@company.com",
      password: await bcrypt.hash("Admin@12345", 12),
      role: "admin",
      department: "IT",
    },
    {
      name: "Support Engineer",
      email: "support@company.com",
      password: await bcrypt.hash("Support@12345", 12),
      role: "support",
      department: "IT",
    },
    {
      name: "John Employee",
      email: "employee@company.com",
      password: await bcrypt.hash("Employee@12345", 12),
      role: "employee",
      department: "Engineering",
    },
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create(u);
      console.log("Created:", u.email);
    } else {
      console.log("Exists:", u.email);
    }
  }

  console.log("\nDemo accounts:");
  console.log("  admin@company.com / Admin@12345");
  console.log("  support@company.com / Support@12345");
  console.log("  employee@company.com / Employee@12345");

  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
