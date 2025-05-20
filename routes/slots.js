import express from "express";
import {
  createSlotAvailability,
  getSlotsByDay,
  getSlotTimes,
} from "../controllers/slots.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// router.get("/", getPatients)
// router.get("/", authenticateToken, getSlotTimes);
// router.post(
//   "/create-slot-availability",
//   authenticateToken,
//   createSlotAvailability
// );
// router.get("/booked-slots", authenticateToken, getDoctorSlots);
router.post(
  "/create-slot-availability",
  authenticateToken,
  createSlotAvailability
);

router.get("/:clinicId", authenticateToken, getSlotsByDay);

export const slotsRoutes = router;
