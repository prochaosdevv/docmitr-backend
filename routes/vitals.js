import express from "express";
import {
  createVital,
  deleteVital,
  getAllVitals,
  getVitalById,
  updateVital,
} from "../controllers/vitals.js";

const router = express.Router();

router.post("/", createVital);
router.get("/", getAllVitals);
router.get("/appointment-vitals", getVitalById);
router.put("/:id", updateVital);
router.delete("/:id", deleteVital);

export const vitalsRouter = router;
