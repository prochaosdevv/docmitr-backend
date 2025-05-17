import express from "express";

import { authenticateToken } from "../middleware/auth.js";
import {
  createTemplateAssets,
  createTemplateAttributes,
  createTemplateList,
  deleteTemplateList,
  updateTemplateAttributes,
} from "../controllers/prescriptions.js";

const router = express.Router();

router.post("/", createTemplateList);
router.delete("/:id", deleteTemplateList);
router.post("/assets/save", authenticateToken, createTemplateAssets);
router.post("/attributes/save", authenticateToken, createTemplateAttributes);
router.put(
  "/attributes/update/:clinicId",
  authenticateToken,
  updateTemplateAttributes
);

export const templateRoutes = router;
