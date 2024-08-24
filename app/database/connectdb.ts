import mongoose from "mongoose";

export default async function connectDb() {
  const uri = process.env.MONGO_URI as string;

  try {
    await mongoose.connect(uri,{dbName:'task_manager'});
    console.log("connected To Database");
  } catch (error) {
    console.log("Error with Connecting to the database");
  }

  return;
}
