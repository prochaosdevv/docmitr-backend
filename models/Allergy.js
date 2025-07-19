import mongoose from "mongoose";

const allergySchema = new mongoose.Schema(
  {
    allergyName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Allergies", allergySchema);
