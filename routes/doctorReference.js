import express from "express";
import {
  createDoctorReference,
  deleteDoctorReference,
  getAllDoctorReferences,
  updateDoctorReference,
} from "../controllers/doctorReference.js";

const router = express.Router();

router.post("/", createDoctorReference);
router.get("/", getAllDoctorReferences);
router.put("/:id", updateDoctorReference);
router.delete("/:id", deleteDoctorReference);

export const doctorReferenceRoutes = router;
