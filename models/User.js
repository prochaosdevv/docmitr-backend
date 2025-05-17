import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  role: {
    type: String,
    enum: ["admin", "doctor", "staff", "patient"],
    required: true,
  },
});

export default mongoose.model("User", userSchema);
