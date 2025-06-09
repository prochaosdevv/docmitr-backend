import mongoose from "mongoose";

const labTestSchema = new mongoose.Schema(
  {
    labTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabTests",
      required: true,
    },
    params: [
      {
        propertyName: {
          type: String,
          required: true,
          trim: true,
        },
        propertyUnit: {
          type: String,
          trim: true,
          default: null,
        },
        dropdownOptions: {
          type: [String], // If null → render as input field; If array → render as dropdown
          default: null,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("LabTestsProperties", labTestSchema);
