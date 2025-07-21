import mongoose from "mongoose";

const prescriptionTemplateSchema = new mongoose.Schema({
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Clinic",
  },
  templateId: {
    type: String,
    required: true,
    trim: true,
  },
  doctorId: {
    type: String,
    required: true,
  },
  config: {
    type: Object,
    required: true,
    default: {},
  },
  templateSettings: {
    type: Object,
    default: {},
  },
});

prescriptionTemplateSchema.index(
  { clinicId: 1, doctorId: 1 },
  { unique: true }
);

export default mongoose.model(
  "PrescriptionTemplate",
  prescriptionTemplateSchema
);
