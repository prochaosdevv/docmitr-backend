import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  issue: {
    type: String,
    required: true,
  },
  item: {
    type: String,
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    default: null,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
});

export default mongoose.model("Report", reportSchema);
