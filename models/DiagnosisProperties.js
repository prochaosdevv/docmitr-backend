import mongoose from "mongoose";

const diagnosisPropertiesSchema = new mongoose.Schema(
  {
    diagnosisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Diagnosis",
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

export default mongoose.model("DiagnosisProperties", diagnosisPropertiesSchema);
