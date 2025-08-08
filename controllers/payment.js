import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import Doctor from "../models/Doctor.js";
import Subscriptions from "../models/Subscriptions.js";
import razorpay from "../utils/razorpay-init.js";
import Transaction from "../models/Transaction.js";

export const executePayment = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const doctorId = req.user.id;

    // Fetch the subscription details
    const subscription = await Subscriptions.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // find doctor details
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const options = {
      amount: Number(subscription.price * 100),
      currency: "INR",
      receipt: `receipt_${doctor.regNo}_${Date.now()}`,
    };

    const result = await razorpay.orders.create(options);

    if (!result) {
      return res.status(500).json({ message: "Failed to create order" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.log("Error executing payment:", error);
  }
};

export const verifyPaymentWebhook = async (req, res) => {
  try {
    const webhookBody = req.body;
    const webhookSignature = req.get("X-Razorpay-Signature");
    const webhookEventId = req.get("X-Razorpay-Event-Id");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    console.log("Received webhook event:", webhookBody);

    const isValid = validateWebhookSignature(
      JSON.stringify(webhookBody),
      webhookSignature,
      webhookSecret
    );

    if (!isValid) {
      console.error("Invalid webhook signature");
      return res.status(400).json({ message: "Invalid signature" });
    }

    // Prevent duplicate webhook processing
    const existingWebhook = await Transaction.findOne({ webhookEventId });
    if (existingWebhook) {
      console.error("Duplicate webhook event");
      return res.status(400).json({ message: "Duplicate webhook" });
    }

    const event = webhookBody.event;
    const paymentEntity = webhookBody.payload?.payment?.entity;

    if (!paymentEntity) {
      console.error("Invalid payment entity");
      return res.status(400).json({ message: "Invalid webhook payload" });
    }

    const { id: txnId, order_id: orderId, notes, amount } = paymentEntity;

    const { subscriptionId, doctorId, receipt } = notes || {};

    if (!txnId || !orderId || !subscriptionId || !doctorId || !receipt) {
      console.error("Missing required fields in webhook");
      return res.status(400).json({ message: "Missing fields" });
    }

    console.log("Processing webhook event:", {
      event,
      txnId,
      orderId,
    });

    if (event === "payment.captured") {
      // Check if transaction already exists
      const existingTxn = await Transaction.findOne({ txnId });

      if (existingTxn) {
        // Just update paymentVerified
        await Transaction.updateOne(
          { txnId },
          { $set: { paymentVerified: true } }
        );
      } else {
        // Create new transaction
        await Transaction.create({
          doctorId,
          subscription: subscriptionId,
          amount: Number(amount / 100),
          event,
          txnId,
          orderId,
          receipt,
          webhookEventId,
          paymentVerified: true,
        });
      }

      const currentDate = new Date();
      const newEndDate = new Date(
        currentDate.setMonth(currentDate.getMonth() + 1)
      );

      // Update doctor's subscriptionEndDate
      await Doctor.findByIdAndUpdate(doctorId, {
        subscription: subscriptionId,
        subscriptionEndDate: newEndDate,
      });

      return res.status(200).json({ message: "Payment captured and verified" });
    }

    if (event === "payment.failed") {
      console.warn("Payment failed");

      // Optional: log failed attempt
      await Transaction.create({
        doctorId,
        subscription: subscriptionId,
        amount: Number(amount / 100),
        event,
        txnId,
        orderId,
        receipt,
        webhookEventId,
        paymentVerified: false,
      });

      return res.status(200).json({ message: "Payment failed" });
    }

    return res.status(200).json({ message: "Unhandled event type" });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
