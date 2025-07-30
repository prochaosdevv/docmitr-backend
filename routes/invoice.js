import express from "express";
import {
  createInvoice,
  deleteInvoice,
  getAllInvoices,
  updateInvoiceStatus,
} from "../controllers/invoice.js";
import { authenticateToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticateToken, isAdmin, createInvoice);
router.get("/", authenticateToken, isAdmin, getAllInvoices);
router.patch("/status", authenticateToken, isAdmin, updateInvoiceStatus);
router.delete("/:invoiceId", authenticateToken, isAdmin, deleteInvoice);

export const invoiceRoutes = router;
