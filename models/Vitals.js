import mongoose from "mongoose";

const vitalsSchema = new mongoose.Schema({
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
  pulse: Number,
  systolic: Number,
  diastolic: Number,
  spo2: Number,
  temperature: Number,
  weight: Number,
  height: Number,
  bmi: Number,
  respiratoryRate: Number,
  bloodGlucose: Number,
  heartRate: Number,
  map: Number,
  rRate: Number,
  bodyFat: Number,
  upperSegment: Number,
  lowerSegment: Number,
  armSpan: Number,
  sittingHeight: Number,
  heightAge: Number,
  egfr: Number,
  fundalHeight: Number,
  diastolicRight: Number,
  diastolicLeft: Number,
  systolicRight: Number,
  systolicLeft: Number,
  muac: Number,
});

export default mongoose.model("Vital", vitalsSchema);
