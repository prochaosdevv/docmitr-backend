import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String },
    country: { type: String, required: true },
    pincode: { type: String },
    area: { type: String },
  },
  { _id: false }
);

const TimeSlotSchema = new mongoose.Schema(
  {
    timeRange: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    appointmentId: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    email: { type: String, required: true },
    patientClinicId: { type: Number, required: true },
    patientUid: { type: String },
    patientName: { type: String, required: true },
    dateOfBirth: { type: String },
    ageYears: { type: String },
    ageMonths: { type: String },
    caretakerName: { type: String },
    bloodGroup: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    dateOfMarriage: { type: String },
    marriedYears: { type: String },
    marriedMonths: { type: String },
    language: { type: String },
    appointmentDate: { type: String, required: true },
    appointmentSession: { type: String, required: true },
    purposeOfVisit: { type: String },
    timeSlot: { type: TimeSlotSchema, required: true },
    roomNo: { type: String },
    address: { type: AddressSchema, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Appointment", appointmentSchema);
