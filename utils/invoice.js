import Invoice from "../models/Invoice.js";
import Subscriptions from "../models/Subscriptions.js";
import { generateInvoiceId } from "../utils/helper-functions.js";

export const generateInvoice = async ({
  doctorId,
  subscription,
  duration,
  amount,
  description,
}) => {
  let invoiceData = {
    invoiceId: generateInvoiceId(),
    doctorId,
    subscription: subscription || null,
  };

  let totalAmount = 0;

  if (subscription) {
    const subscriptionData = await Subscriptions.findById(subscription);
    if (!subscriptionData) throw new Error("Subscription not found");

    totalAmount = subscriptionData.price;
    invoiceData.invoiceDate = new Date();
    invoiceData.dueDate = duration;
    invoiceData.description = `DocMitr-${subscriptionData.planName}`;
  } else {
    if (!amount || !description)
      throw new Error("Missing manual invoice fields");

    let subscriptionEndDate = null;

    const durationInMonths = parseInt(duration, 10);
    if (isNaN(durationInMonths) || durationInMonths <= 0) {
      throw new Error("Invalid subscription duration");
    }

    const now = new Date();
    const end = new Date(now);

    // Set day to 1 temporarily to prevent rollover issues
    end.setDate(1);
    end.setMonth(end.getMonth() + durationInMonths);

    // Now restore day to original (or last day of new month if original day is too big)
    const originalDay = now.getDate();
    const daysInTargetMonth = new Date(
      end.getFullYear(),
      end.getMonth() + 1,
      0
    ).getDate();
    end.setDate(Math.min(originalDay, daysInTargetMonth));

    subscriptionEndDate = end;

    totalAmount = amount;
    invoiceData.invoiceDate = new Date();
    invoiceData.dueDate = subscriptionEndDate;
    invoiceData.description = description;
  }

  const taxableValue = +(totalAmount / 1.18).toFixed(2);
  const cgst = +(taxableValue * 0.09).toFixed(2);
  const sgst = +(taxableValue * 0.09).toFixed(2);

  invoiceData.amount = {
    taxableValue,
    cgst,
    sgst,
    total: totalAmount,
  };

  const newInvoice = new Invoice(invoiceData);
  await newInvoice.save();

  return newInvoice;
};
