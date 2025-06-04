import express from "express";
import {
  addOnDiagnosisProperties,
  addOnFindingsProperties,
  addOnSymptomProperties,
  allMedicineCategories,
  allMedicineCompositions,
  createDiagnosisByAdmin,
  createDiagnosisByDoctor,
  createDiagnosisPropertyByAdmin,
  createDiagnosisPropertyByDoctor,
  createFindingPropertyByAdmin,
  createFindingPropertyByDoctor,
  createFindingsByAdmin,
  createFindingsByDoctor,
  createInstructionsByAdmin,
  createInstructionsByDoctor,
  createInvestigationByAdmin,
  createInvestigationByDoctor,
  createInvestigationPanel,
  createMedicineByAdmin,
  createMedicineByDoctor,
  createProcedureByAdmin,
  createProcedureByDoctor,
  createSymptomByAdmin,
  createSymptomByDoctor,
  createSymptomPropertyByAdmin,
  createSymptomPropertyByDoctor,
  deleteDiagnosis,
  deleteDiagnosisCategory,
  deleteFinding,
  deleteFindingsCategory,
  deleteInvestigationPanel,
  deleteSymptom,
  deleteSymptomCategory,
  editDiagnosisProperty,
  editFindingsProperty,
  editSymptomProperty,
  getAllDiagnosis,
  getAllFindings,
  getAllSymptoms,
  getDiagnosisProperties,
  getFindingsProperties,
  getInvestigationPanels,
  getInvestigationsByIds,
  getPaginatedInstructions,
  getPaginatedInvestigations,
  getPaginatedMedicines,
  getPaginatedProcedures,
  getSymptomProperties,
  searchDiagnosis,
  searchFindings,
  searchInstructions,
  searchInvestigations,
  searchMedicines,
  searchProcedures,
  searchSymptoms,
} from "../controllers/consultantFollowups.js";

const router = express.Router();

router.post("/admin/create", createSymptomByAdmin);
router.post("/doctor/create", createSymptomByDoctor);
router.get("/", getAllSymptoms);
router.post("/admin/symptoms-properties/create", createSymptomPropertyByAdmin);
router.post(
  "/doctor/symptoms-properties/create",
  createSymptomPropertyByDoctor
);
router.get("/symptoms-properties/:symptopId", getSymptomProperties);
router.post("/symptoms-properties/add", addOnSymptomProperties);
router.delete("/symptoms-properties/delete", deleteSymptomCategory);
router.put("/symptoms-properties/edit", editSymptomProperty);
router.get("/symptoms/search", searchSymptoms);
router.delete("/symptoms/delete/:symptopId", deleteSymptom);

// findings

router.post("/findings/admin/create", createFindingsByAdmin);
router.post("/findings/doctor/create", createFindingsByDoctor);
router.get("/findings", getAllFindings);
router.post("/admin/findings-properties/create", createFindingPropertyByAdmin);
router.post(
  "/doctor/findings-properties/create",
  createFindingPropertyByDoctor
);
router.get("/findings-properties/:findingsId", getFindingsProperties);
router.post("/findings-properties/add", addOnFindingsProperties);
router.delete("/findings-properties/delete", deleteFindingsCategory);
router.put("/findings-properties/edit", editFindingsProperty);
router.get("/findings/search", searchFindings);
router.delete("/findings/delete/:findingsId", deleteFinding);

// diagnosis

router.post("/diagnosis/admin/create", createDiagnosisByAdmin);
router.post("/diagnosis/doctor/create", createDiagnosisByDoctor);
router.get("/diagnosis", getAllDiagnosis);
router.post(
  "/admin/diagnosis-properties/create",
  createDiagnosisPropertyByAdmin
);
router.post(
  "/doctor/diagnosis-properties/create",
  createDiagnosisPropertyByDoctor
);
router.get("/diagnosis-properties/:diagnosisId", getDiagnosisProperties);
router.post("/diagnosis-properties/add", addOnDiagnosisProperties);
router.delete("/diagnosis-properties/delete", deleteDiagnosisCategory);
router.put("/diagnosis-properties/edit", editDiagnosisProperty);
router.get("/diagnosis/search", searchDiagnosis);
router.delete("/diagnosis/delete/:diagnosisId", deleteDiagnosis);

// investigations

router.post("/investigations/admin/create", createInvestigationByAdmin);
router.post("/investigations/doctor/create", createInvestigationByDoctor);
router.get("/investigations", getPaginatedInvestigations);
router.post("/investigationsbyIds", getInvestigationsByIds);
router.get("/investigations/search", searchInvestigations);
router.post("/investigations/panel", createInvestigationPanel);
router.get("/investigations/panel", getInvestigationPanels);
router.delete("/investigations/panel/:panelId", deleteInvestigationPanel);

// instructions
router.post("/instructions/admin/create", createInstructionsByAdmin);
router.post("/instructions/doctor/create", createInstructionsByDoctor);
router.get("/instructions", getPaginatedInstructions);
router.get("/instructions/search", searchInstructions);

// procedures

router.post("/procedures/admin/create", createProcedureByAdmin);
router.post("/procedures/doctor/create", createProcedureByDoctor);
router.get("/procedures", getPaginatedProcedures);
router.get("/procedures/search", searchProcedures);

// medicines
router.post("/medicines/admin/create", createMedicineByAdmin);
router.post("/medicines/doctor/create", createMedicineByDoctor);
router.get("/medicines", getPaginatedMedicines); // Assuming this should be a different endpoint
router.get("/medicines/search", searchMedicines);
router.get("/medicines/categories/search", allMedicineCategories);
router.get("/medicines/compositions/search", allMedicineCompositions);

export const consultantFollowups = router;
