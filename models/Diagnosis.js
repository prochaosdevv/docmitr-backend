import mongoose from "mongoose";

const diagnosisSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Diagnosis", diagnosisSchema);
