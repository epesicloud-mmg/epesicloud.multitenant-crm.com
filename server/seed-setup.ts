import { db } from "./db";
import { seedSampleData } from "./seed-data";

async function runSeeding() {
  console.log("🌱 Starting database seeding...");
  
  try {
    await seedSampleData();
    console.log("🎉 All sample data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  }
}

runSeeding();