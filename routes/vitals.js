import express from "express";
import {
  createOrUpdateVital,
  deleteVital,
  getAllMasterVitals,
  getAllVitals,
  getVitalById,
  updateVital,
} from "../controllers/vitals.js";

const router = express.Router();

router.post("/", createOrUpdateVital);
router.get("/", getAllVitals);
router.get("/master", getAllMasterVitals);
router.get("/appointment-vitals", getVitalById);
router.put("/:id", updateVital);
router.delete("/:id", deleteVital);

export const vitalsRouter = router;
