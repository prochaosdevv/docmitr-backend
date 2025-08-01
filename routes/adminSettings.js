import express from "express";
import {
  deleteAdminSettings,
  getAdminSettings,
  updateAdminSettings,
} from "../controllers/adminSettings.js";

const router = express.Router();

router.get("/", getAdminSettings);
router.put("/", updateAdminSettings);
router.delete("/", deleteAdminSettings);

export const adminSettingsRoutes = router;
