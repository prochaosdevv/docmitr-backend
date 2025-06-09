import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
  attachmentDate: {
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
  attachmentList: [
    {
      attachmentS3Url: {
        type: String,
        required: true,
      },
      attachmentExtension: {
        type: String,
        required: true,
      },
      attachmentType: {
        type: String,
        enum: ["image", "document", "video", "audio"],
        required: true,
      },
    },
  ],
});

export default mongoose.model("Attachment", attachmentSchema);
