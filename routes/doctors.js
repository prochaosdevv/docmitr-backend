import express from "express";
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  getDoctorAppointments,
  deleteDoctorByid,
  getDoctorPatients,
  toggleDoctorStatus,
  getLoggedInDoctor,
  getDoctorsExceptLoggedIn,
  getTotalDoctorsCount,
} from "../controllers/doctors.js";
import { loginDoctor } from "../controllers/auth.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getDoctors);
router.get("/count", getTotalDoctorsCount);
router.get("/get-me", getLoggedInDoctor);
router.get("/except-me", getDoctorsExceptLoggedIn);
router.get("/:id", getDoctorById);
router.post("/", isAdmin, createDoctor);
router.put("/:id", isAdmin, updateDoctor);
router.delete("/:id", isAdmin, deleteDoctorByid);
router.get("/:id/appointments", getDoctorAppointments);
router.get("/:id/patients", getDoctorPatients);
router.patch("/status/:id", isAdmin, toggleDoctorStatus);

export const doctorRoutes = router;
