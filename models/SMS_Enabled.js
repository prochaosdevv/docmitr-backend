import mongoose from "mongoose";

const smsEnabledSchema = new mongoose.Schema(
  {
    smsListId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SMS",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SMS_Enabled", smsEnabledSchema);
//
