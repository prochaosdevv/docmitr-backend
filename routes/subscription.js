// routes/subscriptionRoutes.js
import express from "express";
import {
  createSubscription,
  deleteSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
} from "../controllers/subscription.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", isAdmin, createSubscription);
router.get("/", getAllSubscriptions);
router.get("/:id", getSubscriptionById);
router.put("/:id", isAdmin, updateSubscription);
router.delete("/:id", isAdmin, deleteSubscription);

export const subscriptionRoutes = router;
