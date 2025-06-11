import mongoose from "mongoose";

const templateListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    date: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("TemplateList", templateListSchema);
