import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    unique: true, // fixed typo from 'unque'
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
    default: null,
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  amount: {
    type: new mongoose.Schema(
      {
        taxableValue: { type: Number, required: true },
        cgst: { type: Number, required: true },
        sgst: { type: Number, required: true },
        total: { type: Number, required: true },
      },
      { _id: false } // prevent nested _id creation
    ),
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "paid", "overdue"],
    default: "pending",
  },
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
