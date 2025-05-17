import mongoose from "mongoose";

const singleSlotSchema = new mongoose.Schema(
  {
    slotTimes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SingleSlot", singleSlotSchema);
