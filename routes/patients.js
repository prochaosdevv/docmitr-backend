import express from "express";
import {
  // getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientAppointments,
  getPatientMedicalRecords,
  getPatientVitals,
  getPatientsByQuery,
  getPatients,
} from "../controllers/patients.js";

const router = express.Router();

// router.get("/", getPatients)
router.get("/search-patients", getPatientsByQuery);
router.get("/:id", getPatientById);
router.post("/", createPatient);
router.get("/", getPatients);
router.put("/:id", updatePatient);
router.delete("/:id", deletePatient);
router.get("/:id/appointments", getPatientAppointments);
router.get("/:id/medical-records", getPatientMedicalRecords);
router.get("/:id/vitals", getPatientVitals);

export const patientRoutes = router;
