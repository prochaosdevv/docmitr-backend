import mongoose from "mongoose";

const addressHistorySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    address1: {
      type: String,
      required: true,
    },

    address2: {
      type: String,
      default: null,
    },

    area: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
      match: /^\d{6}$/,
    },

    country: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    district: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PatientAddressHistory", addressHistorySchema);
