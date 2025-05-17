import mongoose from "mongoose";

const emailSettingsSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    emailPreferences: {
      programLaunch: {
        type: Boolean,
        default: true,
      },
      appointmentConfirmation: {
        type: Boolean,
        default: false,
      },
      prescriptionSent: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

export const EmailSms = mongoose.model("EmailSms", emailSettingsSchema);
