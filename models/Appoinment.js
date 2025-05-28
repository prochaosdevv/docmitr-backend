import mongoose from "mongoose";

// Sub-schema for defined options
const DefinedOptionSchema = new mongoose.Schema(
  {
    optionTitle: { type: String, required: true },
    values: [{ type: String, required: true }],
  },
  { _id: false }
);

// Sub-schema for mainTitle inside selectedValueAndOptions
const MainTitleSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    isSelected: { type: Boolean, required: true },
  },
  { _id: false }
);

// Sub-schema for selectedValueAndOptions array
const SelectedValueAndOptionSchema = new mongoose.Schema(
  {
    mainTitle: { type: MainTitleSchema, required: true },
    definedOptions: [DefinedOptionSchema],
  },
  { _id: false }
);

// Sub-schema for each section
const FollowUpSectionSchema = new mongoose.Schema(
  {
    sectionTitle: { type: String, required: true },
    selectedValueAndOptions: [SelectedValueAndOptionSchema],
  },
  { _id: false }
);

// Root-level follow-up entry with date and sections
const ConsultationFollowUpEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    sections: [FollowUpSectionSchema],
  },
  { _id: false }
);

// Address schema
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

// TimeSlot schema
const TimeSlotSchema = new mongoose.Schema(
  {
    timeRange: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

// Main Appointment Schema
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
    clinicSpecificId: { type: Number, default: "" },
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

    consultationFollowUpOption: [ConsultationFollowUpEntrySchema],
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
