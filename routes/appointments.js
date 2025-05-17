import express from "express"
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointments.js"

const router = express.Router()

router.get("/", getAppointments)
router.get("/:id", getAppointmentById)
router.post("/", createAppointment)
router.put("/:id", updateAppointment)
router.delete("/:id", deleteAppointment)

export const appointmentRoutes = router
