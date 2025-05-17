import express from "express";
import {
  createEmailSettings,
  createSMS,
  createWhatsappSettings,
  toggleEmailPreference,
  toggleSMS,
} from "../controllers/sms.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticateToken, createSMS);
router.post("/toggle-sms", authenticateToken, toggleSMS);

// whatsapp
router.post("/whatsapp-settings", authenticateToken, createWhatsappSettings);

// email
router.post("/email-settings", authenticateToken, createEmailSettings);
router.patch(
  "/email-settings/toggle",
  authenticateToken,
  toggleEmailPreference
);

export const smsRouter = router;
