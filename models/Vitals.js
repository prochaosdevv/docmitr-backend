import mongoose from "mongoose";

const vitalSchema = new mongoose.Schema(
  {
    vitalName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: [
        "Heart Rate",
        "Blood Pressure",
        "Respiratory Rate",
        "Temperature",
        "Oxygen Saturation",
        "Height",
        "Weight",
        "BMI",
        "Head Circumference",
        "Waist Circumference",
      ],
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      enum: ["bpm", "mmHg", "breaths/min", "°C", "%", "cm", "kg", "kg/m²"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Vital", vitalSchema);
