import mongoose from "mongoose";

const historyOptionSchema = new mongoose.Schema(
  {
    qId: { type: mongoose.Schema.Types.ObjectId, ref: "HistoryQuestion" },
    optName: String,
    displayName: String,
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false, // Default to false if not specified
    },
  },
  { timestamps: true }
);

export default mongoose.model("HistoryOption", historyOptionSchema);
