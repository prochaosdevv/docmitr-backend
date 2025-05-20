import express from "express";
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getLoggedInStaff,
} from "../controllers/staff.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllStaff);
router.get("/get-me", authenticateToken, getLoggedInStaff);
router.get("/:id", getStaffById);
router.post("/", authenticateToken, createStaff);
router.put("/:id", authenticateToken, updateStaff);
router.delete("/:id", authenticateToken, deleteStaff);

export const staffRoutes = router;
