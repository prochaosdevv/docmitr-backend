import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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

export default mongoose.model("MedicineCategory", categorySchema);
