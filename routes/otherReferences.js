import express from "express";
import {
  createOtherReference,
  deleteOtherReference,
  getAllOtherReferences,
  getOtherReferenceById,
  updateOtherReference,
} from "../controllers/otherreferece.js";

const router = express.Router();

router.post("/", createOtherReference);
router.get("/", getAllOtherReferences);
router.get("/:id", getOtherReferenceById);
router.put("/:id", updateOtherReference);
router.delete("/:id", deleteOtherReference);

export const otherReferenceRoutes = router;
