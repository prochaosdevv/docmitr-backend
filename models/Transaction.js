import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    txnId: {
      type: String,
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    webhookEventId: {
      type: String,
      required: true,
    },
    // captured(success) or failed
    event: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    receipt: {
      type: String,
      required: true,
    },
    paymentVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Transaction", transactionSchema);
