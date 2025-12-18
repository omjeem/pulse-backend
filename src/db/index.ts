import mongoose from "mongoose";
import { envConfigs } from "../config/envConfig";

const connectMongoDb = async () => {
  try {
    const MONGO_URI = envConfigs.database_url;

    if (!MONGO_URI) {
      throw new Error("MONGO_URI not set in environment variables");
    }

    await mongoose.connect(MONGO_URI, {
      dbName: "Pulse",
      autoIndex: true, 
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connected Successfully");
  } catch (err: any) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

export default connectMongoDb;
