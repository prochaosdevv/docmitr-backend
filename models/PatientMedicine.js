import mongoose from "mongoose";

const quantitySchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: [
        "tablets",
        "capsules",
        "ml",
        "g",
        "drops",
        "puffs",
        "sachets",
        "other",
      ],
      required: true,
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
      required: true,
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
      required: true,
    },
    dosage: {
      type: String,
      required: true,
    },
    timing: {
      type: timingSchema,
      required: true,
    },
    duration: {
      type: durationSchema,
      required: true,
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
  doses: [doseSchema],
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
