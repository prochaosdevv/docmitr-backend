import express from "express";
import {
  createTemplate,
  getPrescriptionTemplate,
} from "../controllers/prescriptionTemplates.js";

const router = express.Router();

router.post("/templates", createTemplate);
router.get("/templates", getPrescriptionTemplate);

export const prescriptionTemplateRoutes = router;
