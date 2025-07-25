// routes/labLocationRoutes.ts
import express from "express";
import {
  createLabLocation,
  deleteLabLocation,
  getAllLabLocations,
  getLabLocationById,
  updateLabLocation,
} from "../controllers/lab.js";

const router = express.Router();

router.post("/", createLabLocation);
router.get("/", getAllLabLocations);
router.get("/:id", getLabLocationById);
router.put("/:id", updateLabLocation);
router.delete("/:id", deleteLabLocation);

export const labRouter = router;
