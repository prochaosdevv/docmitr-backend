import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    patientUID: { type: String, default: null },
    thirdPartyUID: { type: String, default: null },
    clinicSpecificId: { type: String, default: "" },

    patientId: { type: String, unique: true },

    name: {
      type: String,
      required: true,
      minlength: 2,
    },

    email: {
      type: String,
      default: "",
    },

    caretakerName: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      required: true,
      minlength: 10,
      match: /^\d+$/,
    },

    gender: {
      type: String,
      required: true,
    },

    ageMonths: {
      type: String,
      required: true,
    },

    ageYears: {
      type: String,
      required: true,
    },

    dobYear: {
      type: String,
      default: null,
    },

    dobMonth: {
      type: String,
      default: null,
    },

    dobDate: {
      type: String,
      default: null,
    },

    // -------------

    domYear: {
      type: String,
      match: /^\d*$/,
      default: null,
    },

    domMonth: {
      type: String,
      match: /^\d*$/,
      default: null,
    },

    domDate: {
      type: String,
      match: /^\d*$/,
      default: null,
    },

    marriedSince: {
      type: String,
      default: null,
    },

    bloodGroup: { type: String, default: null },

    adhar: {
      type: String,
      default: null,
      match: /^\d{12}$/,
    },

    language: {
      type: String,
      default: "English",
    },

    purposeOfVisit: { type: String, default: null },

    // timeSlot: {
    //   startTime: {
    //     type: String,
    //     default: "",
    //   },
    //   endTime: {
    //     type: String,
    //     default: "",
    //   },
    // },

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
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

export default mongoose.model("Patient", patientSchema);
