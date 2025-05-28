import mongoose from "mongoose";

const findingsPropertiesSchema = new mongoose.Schema(
  {
    findingsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Findings",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
    details: [
      new mongoose.Schema(
        {
          categoryName: { type: String, default: "" },
          categoryProperties: [
            new mongoose.Schema(
              {
                propertyName: String,
                propertyValue: { type: Boolean, default: false },
              },
              { _id: true }
            ),
          ],
        },
        { _id: true }
      ),
    ],
  },
  { timestamps: true }
);

export default mongoose.model("FindingsProperties", findingsPropertiesSchema);
