import express from "express";

import {
  createDrug,
  createFormulation,
  deleteDrug,
  getAllDrugs,
  getDrugById,
  updateDrug,
} from "../controllers/drugs.js";

const router = express.Router();

router.post("/formulation", createFormulation);
router.post("/", createDrug);
router.get("/", getAllDrugs);
router.get("/:id", getDrugById);
router.put("/:id", updateDrug);
router.delete("/:id", deleteDrug);

export const drugsRouter = router;
