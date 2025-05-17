import mongoose from "mongoose";

const letterheadAndDegreeSchema = new mongoose.Schema({
  degree: {
    type: String,
    default: "",
  },
  letterheadUrl: {
    type: String, // assuming you store the uploaded file URL
    default: "",
  },
});

const templateConfigSchema = new mongoose.Schema(
  {
    general: {
      selectedClinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clinic",
        required: true,
      },
      selectedFont: {
        type: String,
        default: "Arial",
      },
      selectedLanguage: {
        type: String,
        default: "English",
      },
      fontSize: {
        type: Number,
        default: 12,
        min: 8,
        max: 24,
      },
      orientation: {
        type: String,
        enum: ["portrait", "landscape"],
        default: "portrait",
      },
      showDegree: {
        type: Boolean,
        default: true,
      },
    },
    margins: {
      leftMargin: {
        type: Number,
        default: 4,
      },
      rightMargin: {
        type: Number,
        default: 1,
      },
      leftMarginPrescription: {
        type: Number,
        default: 0,
      },
      rightMarginPrescription: {
        type: Number,
        default: 0,
      },
      topMargin: {
        type: Number,
        default: 320,
      },
    },
    content: {
      showHeader: { type: Boolean, default: true },
      showPatientInfo: { type: Boolean, default: true },
      showVitals: { type: Boolean, default: true },
      showComplaints: { type: Boolean, default: true },
      showDiagnosis: { type: Boolean, default: true },
      showMedications: { type: Boolean, default: true },
      showVaccinations: { type: Boolean, default: true },
      showInstructions: { type: Boolean, default: true },
      showTests: { type: Boolean, default: true },
      showReferral: { type: Boolean, default: true },
      showFollowup: { type: Boolean, default: true },
      showFooter: { type: Boolean, default: true },
    },
  },
  { _id: false }
);

const templateAssetSchema = new mongoose.Schema(
  {
    selectedTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TemplateList",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    previewUrl: {
      type: String,
      required: true,
    },
    letterheadAndDegree: {
      type: letterheadAndDegreeSchema,
      default: {},
    },
    templateConfig: {
      type: templateConfigSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

export default mongoose.model("TemplateAssets", templateAssetSchema);
