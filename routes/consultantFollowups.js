import express from "express";
import {
  addOnDiagnosisProperties,
  addOnFindingsProperties,
  addOnSymptomProperties,
  addOrSaveConsultSymptomsData,
  addOrUpdateDosageCalculator,
  addOrUpdateMedicineData,
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
  createOrUpdateProcedureLocation,
  createProcedureByAdmin,
  createProcedureByDoctor,
  createReport,
  createSymptomByAdmin,
  createSymptomByDoctor,
  createSymptomPropertyByAdmin,
  createSymptomPropertyByDoctor,
  deleteDiagnosis,
  deleteDiagnosisCategory,
  deleteFinding,
  deleteFindingsCategory,
  deleteInvestigationPanel,
  deleteMedicine,
  deletePatientSymptoms,
  deleteSymptom,
  deleteSymptomCategory,
  editDiagnosisProperty,
  editFindingsProperty,
  editSymptomProperty,
  getAllDiagnosis,
  getAllergies,
  getAllergiesByPatientId,
  getAllFindings,
  getAllSavedTemplates,
  getAllSymptoms,
  getDataByTemplateId,
  getDiagnosisProperties,
  getDosageCalculatorData,
  getFindingsProperties,
  getInvestigationPanels,
  getInvestigationsByIds,
  getMedicineData,
  getPaginatedInstructions,
  getPaginatedInvestigations,
  getPaginatedMedicines,
  getPaginatedProcedures,
  getPastPatientAppointments,
  getPastPatientSymptomsFindingsDiagnosis,
  getProcedureLocations,
  getSymptomProperties,
  removeMedicineData,
  removerescriptionItem,
  saveDataToTemplate,
  searchDiagnosis,
  searchFindings,
  searchInstructions,
  searchInvestigations,
  searchMedicines,
  searchProcedures,
  searchSymptoms,
  updateDiagnosisName,
  updateFindingName,
  updateMedicineByDoctor,
  updateSymptom,
  upsertPatientInvestigation,
  upsertPrescriptionItem,
  upsetAllergy,
} from "../controllers/consultantFollowups.js";
import { getAppointmentStatsTest } from "../controllers/appointments.js";

const router = express.Router();

router.post("/admin/create", createSymptomByAdmin);
router.post("/doctor/create", createSymptomByDoctor);
router.get("/", getAllSymptoms);
router.post("/admin/symptoms-properties/create", createSymptomPropertyByAdmin);
router.post(
  "/doctor/symptoms-properties/create",
  createSymptomPropertyByDoctor
);
router.put("/edit/symptoms/name/:symptomId", updateSymptom)
router.put("/edit/findings/name/:id", updateFindingName)
router.put("/edit/diagnosis/name/:id", updateDiagnosisName)
router.delete("/symptoms/delete/:symptopId", deleteSymptom);
router.get("/symptoms-properties/:symptopId", getSymptomProperties);
router.post("/symptoms-properties/add", addOnSymptomProperties);
router.delete("/symptoms-properties/delete", deleteSymptomCategory);
router.put("/symptoms-properties/edit", editSymptomProperty);
router.get("/symptoms/search", searchSymptoms);

router.post("/symptoms/save", addOrSaveConsultSymptomsData);

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

// past
router.get(
  "/past/symptoms/:appointmentId",
  getPastPatientSymptomsFindingsDiagnosis
);

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

router.get("/procedures/locations/:appointmentId", getProcedureLocations);
router.post("/procedures/locations", createOrUpdateProcedureLocation);

router.post("/investigations/properties-save", upsertPatientInvestigation);

// medicines
router.post("/medicines/admin/create", createMedicineByAdmin);
router.post("/medicines/doctor/create", createMedicineByDoctor);
router.put("/medicines/doctor/update/:id", updateMedicineByDoctor);
router.delete("/medicines/doctor/delete/:id", deleteMedicine);
router.get("/medicines", getPaginatedMedicines); // Assuming this should be a different endpoint
router.get("/medicines/search", searchMedicines);
router.get("/medicines/categories/search", allMedicineCategories);
router.get("/medicines/compositions/search", allMedicineCompositions);

// allergies
router.get("/allergies", getAllergies);
router.put("/allergies/upsert", upsetAllergy);
router.get("/allergies/:patientId", getAllergiesByPatientId);

router.post("/medicine/properties-save", upsertPrescriptionItem);
router.post("/medicine/properties-remove", removerescriptionItem);
 
router.post("/medicine/properties-save/data", addOrUpdateMedicineData);
router.get("/medicine/properties-save/:medicineId", getMedicineData);
router.delete("/medicine/properties-save/:medicineId", removeMedicineData);

router.post("/templates/appointments/save", saveDataToTemplate);
router.get("/templates/saved", getAllSavedTemplates);
router.get("/templates/data/:templateId", getDataByTemplateId);
router.delete(
  "/templates/data/delete/:symptomId/:appointmentId",
  deletePatientSymptoms
);

// dosage calculator

router.post("/dosage/calculator", addOrUpdateDosageCalculator);
router.get("/dosage/calculator", getDosageCalculatorData);

// reports
router.post("/report", createReport);

// past appointments

router.get("/past/appointments/:appointmentId", getPastPatientAppointments);

export const consultantFollowups = router;
