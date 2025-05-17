import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    mobileNumber: { type: String, required: true },
    email: { type: String },
    patientClinicId: { type: String },
    patientUid: { type: String },
    patientName: { type: String, required: true },
    dateOfBirth: { type: String },
    ageYears: { type: String },
    ageMonths: { type: String },
    caretakerName: { type: String },
    bloodGroup: { type: String },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Female",
    },
    dateOfMarriage: { type: String, default: null },
    marriedYears: { type: String, default: null },
    marriedMonths: { type: String, default: null },
    language: { type: String, default: "English" },
    purposeOfVisit: {
      type: String,
      enum: ["Consultation", "Follow-up", "Procedure", "Check-up", "Emergency"],
      default: "Consultation",
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    date: {
      type: String,
      required: true,
    },
    timeSlot: {
      startTime: { type: String },
      endTime: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
