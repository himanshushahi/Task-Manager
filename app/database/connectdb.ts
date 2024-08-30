import mongoose from "mongoose";

export default async function connectDb() {
  const uri = process.env.MONGO_URI as string;

  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    console.log("Already connected to Database");
    return;
  }

  try {
    await mongoose.connect(uri, { dbName: "task_manager" });
    console.log("Connected to Database");
  } catch (error) {
    console.log("Error connecting to the database:", error);
  }
}
