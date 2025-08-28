import mongoose from "mongoose";

const vitalsSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    vitalsData: [
      {
        vitalId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "VitalMaster",
          required: true, // Reference to the VitalMaster schema
        },
        vitalValue: {
          type: String,
       
        },
      },
    ],
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

export default mongoose.model("Vital", vitalsSchema);
