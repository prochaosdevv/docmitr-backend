import express from "express";
import {
  createAttachment,
  deleteAttachment,
  getAttachmentsByPatientId,
} from "../controllers/attachments.js";

const router = express.Router();

router.post("/upload", createAttachment);
router.get("/patient/:patientId", getAttachmentsByPatientId);
router.delete("/delete/:attachmentlistId/:attachmentId", deleteAttachment);

export const attachmentRoute = router;
