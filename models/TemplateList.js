import mongoose from "mongoose";

const templateListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    defaultSelection: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("TemplateList", templateListSchema);
