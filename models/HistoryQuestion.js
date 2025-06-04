import mongoose from "mongoose";

const historyQuestionSchema = new mongoose.Schema(
  {
    qname: {
      type: String,
      default: null, // Default to null if not specified
    },
    inputtype: {
      type: String,
      enum: ["single", "multi", "input"],
      default: null,
    },
    type: { type: String, enum: ["main", "sub"], default: null },
    title: {
      type: String,
      default: null, // Default to null if not specified
    },
    mainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HistoryQuestion",
      default: null,
    },
    status: {
      type: Boolean,
      default: false,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HistoryTemplate",
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false, // Default to false if not specified
    },
  },
  { timestamps: true }
);

export default mongoose.model("HistoryQuestion", historyQuestionSchema);

// Question Creation Example: Postman data

// {
//   qname: "Medical Problems";
//   inputtype: "multi";
//   title: "Select Medical Problems";
//   type: "sub";
//   templateId: "60c72b2f9b1d8c001c8e4f3a";
// }
