import mongoose from "mongoose";

const patientHistorySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HistoryQuestion",
    },
    answer: mongoose.Schema.Types.Mixed, // Can be array or string
    answerDuraion: {
      type: String,
      default: null, // Duration of the answer if applicable
    },
    answerMedication: {
      type: [{}],
      default: null, // Medication related to the answer if applicable
    },
    notes: {
      type: String,
      default: null, // Additional notes related to the answer
    },
  },
  { timestamps: true }
);

export default mongoose.model("PatientHistory", patientHistorySchema);
