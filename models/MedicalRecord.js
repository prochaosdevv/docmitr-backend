import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  date: { type: String },
  diagnosis: String,
  prescription: String,
  notes: String,
  attachments: [String],
});

export default mongoose.model("MedicalRecord", medicalRecordSchema);
