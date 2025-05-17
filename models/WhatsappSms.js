import mongoose from "mongoose";

const generalSettingsSchema = new mongoose.Schema({
  isWhatsappEnabled: { type: Boolean, default: false },
  appointmentReminders: { type: Boolean, default: false },
  prescriptionNotifications: { type: Boolean, default: false },
  testResults: { type: Boolean, default: false },
  billingNotifications: { type: Boolean, default: false },
});

const messageTemplatesSchema = new mongoose.Schema({
  appointmentReminder: {
    template: { type: String, required: true },
    variables: [{ type: String }], // e.g., ['Patient Name', 'Doctor Name', 'Date', 'Time', 'Clinic Phone']
  },
  prescriptionNotification: {
    template: { type: String, required: true },
    variables: [{ type: String }],
  },
  testResults: {
    template: { type: String, required: true },
    variables: [{ type: String }],
  },
});

const businessProfileSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  businessPhone: { type: String, required: true },
  wabaId: { type: String, required: true },
  apiKey: { type: String, required: true },
  businessDescription: { type: String },
});

const whatsappSettingsSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    generalSettings: generalSettingsSchema,
    messageTemplates: messageTemplatesSchema,
    businessProfile: businessProfileSchema,
  },
  { timestamps: true }
);

export const WhatsappSms = mongoose.model(
  "WhatsappSms",
  whatsappSettingsSchema
);
