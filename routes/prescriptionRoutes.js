import express from "express";
import {
  createTemplate,
  getPrescriptionTemplate,
  getTemplateSettings,
  upsertTemplateSettings,
} from "../controllers/prescriptionTemplates.js";

const router = express.Router();

router.post("/templates", createTemplate);
router.get("/templates", getPrescriptionTemplate);
router.get("/templates/settings", getTemplateSettings);
router.put("/templates/settings", upsertTemplateSettings);

export const prescriptionTemplateRoutes = router;
