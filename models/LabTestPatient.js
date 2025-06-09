import mongoose from "mongoose";

const labTestPatientSchema = new mongoose.Schema(
  {
    reportDate: {
      type: Date,
    },
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
    labTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabTests",
      required: true,
    },
    registeredvalue: [
      {
        propertyId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "LabTestsProperties",
          required: true,
        },
        propertyValue: {
          type: String,
          trim: true,
          default: null,
        },
        propertyStatus: {
          type: String,
          enum: ["Up", "up", "High", "high", "Normal", "normal", "Low", "low"],
          default: null,
        },
      },
    ],
    status: {
      type: String,
      enum: ["Normal", "normal", "Abnormal", "abnormal"],
      default: null,
    },
    impression: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("LabTestPatient", labTestPatientSchema);
