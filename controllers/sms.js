import { EmailSms } from "../models/EmailSms.js";
import SMS from "../models/SMS.js";
import SMS_Enabled from "../models/SMS_Enabled.js";
import { WhatsappSms } from "../models/WhatsappSms.js";

export const getAllSMS = async (req, res) => {
  try {
    const smsList = await SMS.find().sort({ createdAt: -1 });
    res.status(200).json(smsList);
  } catch (error) {
    console.error("Error fetching SMS templates:", error);
    res.status(500).json({ message: "Failed to fetch SMS templates" });
  }
};

export const createSMS = async (req, res) => {
  const { key, message } = req.body;

  if (!key || !message) {
    return res.status(400).json({ message: "Key and message are required" });
  }

  try {
    // Check if key already exists
    const existing = await SMS.findOne({ key });
    if (existing) {
      return res
        .status(409)
        .json({ message: "SMS with this key already exists" });
    }

    const newSMS = await SMS.create({ key, message });
    res.status(201).json(newSMS);
  } catch (error) {
    console.error("Error creating SMS template:", error);
    res.status(500).json({ message: "Failed to create SMS template" });
  }
};

export const toggleSMS = async (req, res) => {
  try {
    const { smsId } = req.query;
    const doctorId = req.user.id;

    if (!smsId) {
      return res.status(400).json({ message: "SMS ID is required" });
    }

    // Check if the SMS template exists
    const smsTemplate = await SMS.findById(smsId);
    if (!smsTemplate) {
      return res.status(404).json({ message: "SMS setting not found" });
    }

    // Check if the SMS is already enabled
    const existingSMS = await SMS_Enabled.findOne({
      smsListId: smsId,
      doctorId,
    });

    if (existingSMS) {
      // If the SMS is already enabled, remove the entry
      if (Boolean(existingSMS.enabled) === true) {
        await SMS_Enabled.deleteOne({ _id: existingSMS._id });
        return res.status(200).json({ message: "SMS disabled" });
      }
    } else {
      // If the SMS is not enabled, create a new entry
      const newSMS = await SMS_Enabled.create({
        smsListId: smsId,
        doctorId,
        enabled: true,
      });
      return res.status(201).json(newSMS);
    }
  } catch (error) {
    console.log("Error toggling SMS:", error);
    res.status(500).json({ message: "Failed to toggle SMS" });
  }
};

// whatsapp settings

export const createWhatsappSettings = async (req, res) => {
  try {
    const { generalSettings, messageTemplates, businessProfile } = req.body;

    const doctorId = req.user.id;

    const settings = new WhatsappSms({
      doctorId,
      generalSettings,
      messageTemplates,
      businessProfile,
    });

    await settings.save();
    res
      .status(201)
      .json({ message: "WhatsApp settings created successfully", settings });
  } catch (error) {
    console.error("Error creating WhatsApp settings:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// email settings

export const createEmailSettings = async (req, res) => {
  try {
    const doctorId = req.user.id;

    // Prevent duplicate
    const existing = await EmailSms.findOne({ doctorId });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Settings already exist for this doctor" });
    }

    const newSettings = await EmailSms.create({ doctorId });
    res.status(201).json({ message: "Email settings created", newSettings });
  } catch (error) {
    res.status(500).json({ message: "Failed to create settings", error });
  }
};

export const toggleEmailPreference = async (req, res) => {
  try {
    const { preferenceKey } = req.body;
    const doctorId = req.user.id;

    // Ensure the preferenceKey is valid
    const validKeys = [
      "programLaunch",
      "appointmentConfirmation",
      "prescriptionSent",
    ];
    if (!validKeys.includes(preferenceKey)) {
      return res.status(400).json({ message: "Invalid preference key" });
    }

    const settings = await EmailSms.findOne({ doctorId });
    if (!settings) {
      return res
        .status(404)
        .json({ message: "Settings not found for this doctor" });
    }

    // Toggle the boolean value
    const currentValue = settings.emailPreferences[preferenceKey];
    settings.emailPreferences[preferenceKey] = !currentValue;

    await settings.save();
    res.status(200).json({ message: "Preference toggled", data: settings });
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle preference", error });
  }
};
