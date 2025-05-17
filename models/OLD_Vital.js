import mongoose from "mongoose";

const vitalSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  recordDate: { type: String },
  bloodPressure: String,
  heartRate: Number,
  temperature: Number,
  respiratoryRate: Number,
  oxygenSaturation: Number,
  weight: Number,
  height: Number,
});

export default mongoose.model("Vital", vitalSchema);
