import mongoose from "mongoose";
import { MONGO_URI } from "../constants/env";

const connectToDatabase = async () => {
  try {
    console.log("🛠️ Connecting to MongoDB...");

    await mongoose.connect(MONGO_URI);

    console.log("✅ Database connected successfully.");
  } catch (e) {
    console.error("❌ Could not connect to Database:", e);
    process.exit(1);
  }
};

export default connectToDatabase;
