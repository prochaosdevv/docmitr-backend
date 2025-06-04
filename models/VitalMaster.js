import mongoose from "mongoose";

const vitalMasterSchema = new mongoose.Schema(
  {
    vitalName: {
      type: String,
      required: true,
      unique: true, // Ensure each vital name is unique
    },
    unitType: {
      type: String,
      default: null, // Optional field for unit type
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

export default mongoose.model("VitalMaster", vitalMasterSchema);
