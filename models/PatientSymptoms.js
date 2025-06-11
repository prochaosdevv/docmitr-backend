import mongoose from "mongoose";

const patientSymptomsSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TemplateList",
    default: null,
  },
  note: { type: String, default: null },
  since: { type: String, default: null },
  severity: { type: String, default: null },
  symptomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Symptoms",
    required: true,
  },
  details: {
    type: [
      {
        detailId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        properties: {
          type: [
            {
              propertyId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
              },
              propertyValue: { type: Boolean, default: false },
            },
          ],
          default: [],
        },
      },
    ],
    default: [], // Details array defaults to empty
  },
});

export default mongoose.model("PatientSymptoms", patientSymptomsSchema);
