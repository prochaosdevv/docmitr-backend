import express from "express";
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentByIds,
  getAppointmentDetails,
} from "../controllers/appointments.js";

const router = express.Router();

router.get("/", getAppointments);
router.post("/", createAppointment);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);
router.get("/all/:clinicId", getAppointmentByIds);
router.get("/:appointmentId", getAppointmentDetails);

export const appointmentRoutes = router;
