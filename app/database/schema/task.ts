import mongoose from "mongoose";
import userModel from "./user";
import WorkSpace from "./workspace";
const { Schema } = mongoose;

const TaskSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const ColumnSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  tasks: [TaskSchema], // Embedding TaskSchema in an array
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: userModel,
  },
  workSpace: {
    type: mongoose.Schema.ObjectId,
    ref: WorkSpace,
  },
});

const Column = mongoose.models.Column || mongoose.model("Column", ColumnSchema);

export default Column;
