import mongoose from "mongoose";

const frequencySchema = new mongoose.Schema(
  {
    morning: { type: Boolean, default: false },
    afternoon: { type: Boolean, default: false },
    evening: { type: Boolean, default: false },
    night: { type: Boolean, default: false },
    sos: { type: Boolean, default: false },
  },
  { _id: false }
);

const drugSchema = new mongoose.Schema(
  {
    brandName: { type: String, required: true },
    companyName: { type: String, default: "" },
    mrp: { type: String, default: "" },
    genericName: { type: String, default: "" },
    showGenericName: { type: Boolean, default: false },

    routeType: {
      type: String,
      enum: ["oral", "topical", "injection", "inhalation", "other"],
      default: "oral",
    },

    formulation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Formulation",
      required: true,
    },

    strengthValue: { type: String, default: "" },
    strengthUnit: {
      type: String,
      enum: ["MG", "ML", "G", "MCG", "IU"],
      default: "MG",
    },

    doseType: {
      type: String,
      enum: [
        "fixed-dose",
        "mg-kg-dose",
        "mg-kg-day",
        "mg-m2-dose",
        "mg-m2-day",
      ],
      default: "fixed-dose",
    },

    howMuch: { type: String, default: "" },

    frequency: {
      type: frequencySchema,
      default: () => ({}),
    },

    duration: { type: String, default: "" },
    durationUnit: {
      type: String,
      enum: ["days", "weeks", "months"],
      default: "days",
    },

    stripVolume: { type: String, default: "" },

    relationWithFood: {
      type: String,
      enum: ["before", "after", "with", "none"],
      default: "after",
    },

    drugInstructions: { type: String, default: "" },

    verified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Drug", drugSchema);
