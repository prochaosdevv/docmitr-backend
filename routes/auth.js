import express from "express";
import {
  login,
  register,
  getCurrentUser,
  logout,
  loginDoctor,
  registerAdmin,
  loginAdmin,
  getAdmin,
  logoutAdmin,
} from "../controllers/auth.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/me", authenticateToken, getCurrentUser);
router.post("/logout", authenticateToken, logout);
router.post("/doctor/login", loginDoctor);
router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);
router.get("/admin/get-me", authenticateToken, getAdmin);
router.post("/admin/logout", logoutAdmin);

export const authRoutes = router;
