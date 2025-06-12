import mongoose from "mongoose";

const patientInvestigationSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
    unique: true, // one record per appointment
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TemplateList",
    default: null,
  },
  investigations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Investigation",
    },
  ],
  instructions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructions",
    },
  ],
  procedures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Procedures",
    },
  ],
});

export default mongoose.model(
  "PatientInvestigation",
  patientInvestigationSchema
);
