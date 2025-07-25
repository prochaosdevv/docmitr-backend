import express from "express";
import {
  createMasterVital,
  createOrUpdateVital,
  deleteMasterVital,
  deleteVital,
  getAllMasterVitals,
  getAllVitals,
  getMasterVitalByDoctor,
  getVitalById,
  updateMasterVital,
  updateVital,
} from "../controllers/vitals.js";

const router = express.Router();

router.post("/", createOrUpdateVital);
router.get("/", getAllVitals);
router.get("/master", getAllMasterVitals);
router.get("/appointment-vitals", getVitalById);
router.put("/:id", updateVital);
router.delete("/:id", deleteVital);

router.get("/master/custom", getMasterVitalByDoctor);
router.post("/master", createMasterVital);
router.put("/master/:id", updateMasterVital);
router.delete("/master/:id", deleteMasterVital);

export const vitalsRouter = router;
