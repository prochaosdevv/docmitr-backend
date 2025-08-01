import mongoose from "mongoose";

const adminSettingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    landMark: {
      type: String,
      required: true,
    },
    pinCode: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AdminSettings ||
  mongoose.model("AdminSettings", adminSettingsSchema);
