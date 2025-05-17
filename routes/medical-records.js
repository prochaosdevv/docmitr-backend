import express from "express"
import {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getVitals,
  createVitals,
  updateVitals,
  deleteVitals,
} from "../controllers/medical-records.js"

const router = express.Router()

router.get("/", getMedicalRecords)
router.get("/:id", getMedicalRecordById)
router.post("/", createMedicalRecord)
router.put("/:id", updateMedicalRecord)
router.delete("/:id", deleteMedicalRecord)

router.get("/vitals", getVitals)
router.post("/vitals", createVitals)
router.put("/vitals/:id", updateVitals)
router.delete("/vitals/:id", deleteVitals)

export const medicalRecordRoutes = router
