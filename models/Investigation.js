import mongoose from "mongoose";

const investigationPanelSchema = new mongoose.Schema(
  {
    panelName: {
      type: String,
      default: "",
    },
    investigationIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Investigation",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const investigationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    default: null,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Investigation", investigationSchema);

export const InvestigationPanel = mongoose.model(
  "InvestigationPanel",
  investigationPanelSchema
);
