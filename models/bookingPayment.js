import mongoose from "mongoose";

const bookingPaymentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    txnId: {
      type: String,
      required: true,
      unique: true, 
    },
    amount: {
      type: Number,
      required: true,
    },

  },
  { timestamps: true }
);




export default mongoose.model("BookingPayment", bookingPaymentSchema);
