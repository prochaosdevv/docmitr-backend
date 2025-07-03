import mongoose from "mongoose";

// Schema for selected conditions with their details
const selectedConditionSchema = new mongoose.Schema({
  name: { type: String, default: null },
  duration: { type: String, default: null },
  medication: { type: Boolean, default: null },
  medicationDetails: [{ type: String, default: null }],
});

// Schema for question answers
const questionAnswerSchema = new mongoose.Schema({
  // This field can accept either an ObjectId or a string
  questionId: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    get: function (value) {
      // Return as is - could be ObjectId or string
      return value;
    },
    set: function (value) {
      // Try to convert to ObjectId if possible, otherwise keep as string
      try {
        return new mongoose.Types.ObjectId(value);
      } catch (e) {
        return value; // Keep as string if not a valid ObjectId
      }
    },
  },
  title: { type: String, required: true },
  inputType: { type: String },
  mainId: { type: String },
  options: [{ type: String }],
  answer: mongoose.Schema.Types.Mixed, // Can be string, array, or object
  selectedOptions: [selectedConditionSchema],
  note: {
    type: String,
    default: null,
  },
  isCustom: {
    type: Boolean,
    default: false,
  },
});

// Main medical history schema
const historySaveSchema = new mongoose.Schema(
  {
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "HistoryTemplate",
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Patient",
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Appointment",
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Doctor",
    },
    answers: [questionAnswerSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Create index for efficient querying
historySaveSchema.index({
  templateId: 1,
  patientId: 1,
  appointmentId: 1,
});

export default mongoose.model("HistorySave", historySaveSchema);
