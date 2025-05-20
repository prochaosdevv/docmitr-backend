import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  zipCode: {
    type: String,
  },
  bio: {
    type: String,
  },
  consultationFee: {
    type: Number,
  },
  subscriptionType: {
    type: String,
    enum: ["Basic", "Whitelabel"],
    default: "Basic",
  },
  active: {
    type: Boolean,
    default: true,
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: "doctor",
  },
});

export default mongoose.model("Doctor", doctorSchema);
