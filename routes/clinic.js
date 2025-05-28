import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  createClinic,
  deleteClinic,
  getClinic,
  getClinicById,
  getClinicsByDoctorOrStaffId,
  getTotalClinics,
  updateClinic,
} from "../controllers/clinic.js";

const router = express.Router();

router.post("/", authenticateToken, createClinic);
router.get("/", getClinic);
router.get("/:clinicId", getClinicById);
router.put("/:id", updateClinic);
router.delete("/:id", deleteClinic);
router.get("/count", getTotalClinics);
router.get("/doctor/:userId", authenticateToken, getClinicsByDoctorOrStaffId);

export const clinicRoutes = router;
