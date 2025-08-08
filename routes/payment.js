import express from "express";
import {
  executePayment,
  verifyPaymentWebhook,
} from "../controllers/payment.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/execute-payment", authenticateToken, executePayment);
router.post("/webhook", verifyPaymentWebhook);

export const paymentRoutes = router;
