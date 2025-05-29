import mongoose from "mongoose";

const instructionSchema = new mongoose.Schema({
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

export default mongoose.model("Instructions", instructionSchema);
