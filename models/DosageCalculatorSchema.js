import mongoose from "mongoose";

const dosageCalculatorSchema = new mongoose.Schema({
  selectedQuantity: {
    type: String,
    required: true,
  },
  factor: {
    type: String, // Change to Number if it's always numeric
    default: null,
  },
  strength: {
    type: String, // Change to Number if it's always numeric
    default: null,
  },
  maxValue: {
    type: String, // Change to Number if it's always numeric
    default: null,
  },
  multiplier: {
    type: String,
    default: null,
  },
  maxDosage: {
    type: String,
    default: null,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    default: null,
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    default: null,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    default: null,
  },
});

export default mongoose.model("DosageCalculatorSchema", dosageCalculatorSchema);
