import Invoice from "../models/Invoice.js";
import Subscriptions from "../models/Subscriptions.js";
import { generateInvoiceId } from "../utils/helper-functions.js";

export const generateInvoice = async ({
  doctorId,
  subscription,
  amount,
  description,
  invoiceDate,
  dueDate,
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
    invoiceData.invoiceDate = subscriptionData.startDate;
    invoiceData.dueDate = subscriptionData.endDate;
    invoiceData.description = `DocMitr-${subscriptionData.planName}`;
  } else {
    if (!amount || !description)
      throw new Error("Missing manual invoice fields");

    totalAmount = amount;
    invoiceData.invoiceDate = invoiceDate || new Date();
    invoiceData.dueDate =
      dueDate || new Date(new Date().setMonth(new Date().getMonth() + 1));
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
