import mongoose from "mongoose";

const quantitySchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: "tablets",
    },
  },
  { _id: false }
);

const timingSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["default", "custom"],
      default: "default",
    },
    timingFrequency: {
      type: String,
      required: false,
    },
    interval: {
      type: String,
      default: "",
    },
    frequency: {
      type: String,
      default: "",
    },
    mealTiming: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const durationSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

// Schema for each individual dose
const doseSchema = new mongoose.Schema(
  {
    doseNumber: {
      type: String,
      required: true,
    },
    quantity: {
      type: quantitySchema,
      default: {
        value: 1,
        unit: "tablets",
      },
    },
    dosage: {
      type: String,
    },
    timing: {
      type: timingSchema,
    },
    duration: {
      type: durationSchema,
    },
    note: {
      type: String,
      default: "",
    },
    prescriptionType: {
      type: String,
      enum: ["SOS", "Till Required", "To Continue", "Stat", ""],
      default: "",
    },
  },
  { _id: false }
);

const prescriptionItemSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TemplateList",
    default: null,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    default: null,
  },
  isStarred: {
    type: Boolean,
    default: false,
  },
  doses: [doseSchema],
  allergies: [
    {
      type: String,
    },
  ],
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    default: null,
  },
});

// Create a compound index to ensure uniqueness for appointmentId + medicineId
prescriptionItemSchema.index(
  { appointmentId: 1, medicineId: 1 },
  { unique: true }
);

export const PrescriptionItem = mongoose.model(
  "PatientMedicine",
  prescriptionItemSchema
);
