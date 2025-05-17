import mongoose from "mongoose";

// Helper function to format date as DD-MM-YYYY
function getDefaultDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // 0-indexed
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
}

const slotAvailabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },
    room: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
      default: getDefaultDate, // Default value will be like "04-05-2025"
      index: true,
    },
    time: {
      type: String,
      required: true,
      enum: ["Morning", "Afternoon", "Evening"],
      default: "Morning",
    },
    adjustTiming: {
      timeSegment: {
        type: String,
        required: true,
        enum: ["Morning", "Afternoon", "Evening"],
        default: "Morning",
      },
      startTIme: {
        type: String,
        required: true,
      },
      endTime: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("SlotAvailability", slotAvailabilitySchema);
