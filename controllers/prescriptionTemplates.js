import PrescriptionTemplates from "../models/PrescriptionTemplates.js";

// Create a new template
export const createTemplate = async (req, res) => {
  try {
    const { clinicId, templateId, config } = req.body;

    const doctorId = req.user.id;

    const existingTemplate = await PrescriptionTemplates.findOne({
      clinicId,
      doctorId,
    });

    if (existingTemplate) {
      // Update existing template
      const updatedTemplate = await PrescriptionTemplates.findOneAndUpdate(
        { clinicId, doctorId },
        {
          templateId,
          config,
          templateSettings: existingTemplate.templateSettings || {},
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Template updated successfully for this clinic",
        data: updatedTemplate,
      });
    }

    // Create new template
    const newTemplate = await PrescriptionTemplates.create({
      clinicId,
      templateId,
      doctorId,
      config,
      templateSettings: {
        showFindings: true,
        showComplaints: true,
        showDiagnosis: true,
        showHandout: true,
        showFollowup: true,
        showDrugs: true,
        showReferences: true,
        applyOnlyDrugsWhenApplyPastPrescription: true,
        sharePrescriptionWithPatients: true,
        showDrugVolumeOnPrescription: true,
        showLastVisit: true,
        showTime: true,
        showClinicalNotes: true,
        showPatientAddress: true,
        showMobileNumber: true,
        showAnthropometry: true,
        showSpecialDrugInstructions: true,
        showTests: true,
        showInstructions: true,
        showProcedures: true,
        showSignature: true,
        showDoctorDetails: true,
        printGrowthChart: true,
        printQRCode: true,
        showHistory: true,
        printPatientMilestone: true,
        showGenericNameFirst: true,
        showGenericName: true,
        showRegionalTranslations: true,
        showOnlyGenericName: true,
        prescribeOralDropsInMl: true,
        showClinicNameInsteadOfDoctor: true,
        showDrugVolume: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Template created successfully",
      data: newTemplate,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get template by doctorId and clinicId
export const getPrescriptionTemplate = async (req, res) => {
  try {
    const { clinicId } = req.query;

    const doctorId = req.user.id;

    if (!clinicId || !doctorId) {
      return res.status(400).json({
        success: false,
        message: "clinicId and doctorId are required",
      });
    }

    const template = await PrescriptionTemplates.findOne({
      clinicId,
      doctorId,
    });

    if (!template) {
      return res
        .status(200)
        .json({ success: false, message: "Template not found" });
    }

    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTemplateSettings = async (req, res) => {
  try {
    const { clinicId } = req.query;

    const doctorId = req.user.id;

    const template = await PrescriptionTemplates.findOne({
      clinicId,
      doctorId,
    });

    if (!template) {
      return res.status(200).json({
        success: false,
        message: "Template not found",
        data: {},
      });
    }

    res.status(200).json({
      success: true,
      data: template.templateSettings || {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching template settings",
      error: error.message,
    });
  }
};

export const upsertTemplateSettings = async (req, res) => {
  try {
    const { clinicId } = req.query;
    const { templateSettings } = req.body;

    const doctorId = req.user.id;

    if (!templateSettings) {
      return res.status(400).json({
        success: false,
        message: "templateSettings is required",
      });
    }

    const updatedTemplate = await PrescriptionTemplates.findOneAndUpdate(
      { clinicId, doctorId },
      { templateSettings },
      { new: true }
    );

    if (!updatedTemplate) {
      return res.status(404).json({
        success: false,
        message:
          "Template not setup for this clinic. Please setup a template first.",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedTemplate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating template settings",
      error: error.message,
    });
  }
};
