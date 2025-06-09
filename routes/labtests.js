import express from "express";
import {
  addOrUpdateLabTestPatient,
  deleteLabTestPatient,
  getLabPropertiesByTestId,
  getLabTestRecords,
  getLabTestsByPatientId,
} from "../controllers/labtests.js";

const router = express.Router();

router.get("/", getLabTestRecords);
router.get("/:labTestId", getLabPropertiesByTestId);
router.post("/save-labtest-data", addOrUpdateLabTestPatient);
router.get("/patient/:patientId", getLabTestsByPatientId);
router.delete("/patient/:testId", deleteLabTestPatient);

export const labTestsRoute = router;
