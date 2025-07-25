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
    isAdmin: {
      type: Boolean,
      default: false, // Indicates if the vital is admin-defined
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true, // Reference to the Doctor schema
    },
    sortOrder: {
      type: Number,
      default: 0, // Default sort order for displaying vitals
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

export default mongoose.model("VitalMaster", vitalMasterSchema);
