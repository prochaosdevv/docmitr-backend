import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  position: String,
  department: String,
  joinDate: Date,
  avatar: String,
});

export default mongoose.model("Staff", staffSchema);
