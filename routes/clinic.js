import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  createClinic,
  deleteClinic,
  getClinic,
  getClinicsByDoctorId,
  getTotalClinics,
  updateClinic,
} from "../controllers/clinic.js";

const router = express.Router();

router.post("/", authenticateToken, createClinic);
router.get("/", getClinic);
router.put("/:id", updateClinic);
router.delete("/:id", deleteClinic);
router.get("/count", getTotalClinics);
router.get("/doctor/:doctorId", authenticateToken, getClinicsByDoctorId);

export const clinicRoutes = router;
