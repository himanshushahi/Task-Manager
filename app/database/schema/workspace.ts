import mongoose, { models } from "mongoose";
import userModel from "./user";
const Schema = mongoose.Schema;

const WorkSpaceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: userModel,
  },
  members: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: userModel,
  },
});

const WorkSpace =
  models.WorkSpace || mongoose.model("WorkSpace", WorkSpaceSchema);

export default WorkSpace;
