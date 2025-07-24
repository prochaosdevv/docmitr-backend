import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicineCategory", // Reference to the MedicineCategory model
    },
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    unit_type: {
      type: String,
      default: null,
    },
    compositionName: {
      type: String,
      required: true,
      trim: true,
    },
    compositionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Composition", // Reference to the Composition model
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor", // Reference to the Doctor model
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false, // Default value for isAdmin
    },
  },
  {
    timestamps: true, // Optional: adds createdAt and updatedAt
  }
);

export default mongoose.model("Medicine", medicineSchema);
