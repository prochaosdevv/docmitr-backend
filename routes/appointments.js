import express from "express";
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentByIds,
  getAppointmentDetails,
  updateCheckInCheckOut,
  getAppointmentStatsTest,
  updateProcedureDate,
  updateNotes,
} from "../controllers/appointments.js";

const router = express.Router();

router.get("/", getAppointments);
router.post("/", createAppointment);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);
router.get("/all/:clinicId", getAppointmentByIds);
router.get("/:appointmentId", getAppointmentDetails);
router.put("/:appointmentId/check-in-check-out", updateCheckInCheckOut);
router.get("/stats/test", getAppointmentStatsTest);
router.put("/procedure-date/update/:id", updateProcedureDate);
router.put("/notes/update/:id", updateNotes);

export const appointmentRoutes = router;
