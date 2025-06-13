import express from "express";
import {
  createHistoryTemplateByAdmin,
  createHistoryTemplateByDoctor,
  deleteHistoryTemplateByAdmin,
  deleteHistoryTemplateByDoctor,
  getAllHistoryTemplates,
  getHistoryTemplateById,
  getMedicalHistory,
  saveHistoryTemplate,
  updateHistoryTemplateByAdmin,
  updateHistoryTemplateByDoctor,
} from "../controllers/historyTemplate.js";
import {
  createHistoryQuestionByAdmin,
  createHistoryQuestionByDoctor,
  getHistoryMasterQyuestionsOnly,
  getHistoryOptionsByQuestionId,
  getHistorySubQyuestionsOnly,
} from "../controllers/historyQuestions.js";
import { createOptions } from "../controllers/historyOptions.js";

const router = express.Router();

// template routes

// Admin routes
router.post("/templates/admin/create", createHistoryTemplateByAdmin);
router.put("/admin/:id", updateHistoryTemplateByAdmin);
router.delete("/admin/:id", deleteHistoryTemplateByAdmin);
// Doctor routes
router.post("/templates/doctor/create", createHistoryTemplateByDoctor);
router.put("/doctor/:id", updateHistoryTemplateByDoctor);
router.delete("/doctor/:id", deleteHistoryTemplateByDoctor);
// Common routes
router.get("/templates/all", getAllHistoryTemplates);
router.get("/:id", getHistoryTemplateById);

// questions routes
router.post("/questions/admin/create", createHistoryQuestionByAdmin);
router.post("/questions/doctor/create", createHistoryQuestionByDoctor);
router.get("/questions/master", getHistoryMasterQyuestionsOnly);
router.get("/questions/sub", getHistorySubQyuestionsOnly);

// options
router.post("/options/create", createOptions);
router.get("/options/:questionId", getHistoryOptionsByQuestionId);

router.post("/template/save", saveHistoryTemplate);
router.get("/template/get-saved-data", getMedicalHistory);

export const historyTemplatesRoutes = router;
