import mongoose from "mongoose";

const headoutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Headouts", headoutSchema);
