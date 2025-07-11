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
        { templateId, config },
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
