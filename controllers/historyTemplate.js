import HistoryTemplates from "../models/HistoryTemplate.js";

export const createHistoryTemplateByAdmin = async (req, res) => {
  try {
    const admin = req.user;
    const templateData = {
      ...req.body,
      doctorId: null,
      isAdmin: admin.role === "admin" ? true : false,
    };

    const newTemplate = await HistoryTemplates.create(templateData);
    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const createHistoryTemplateByDoctor = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const templateData = {
      name: req.body.name,
      doctorId,
      isAdmin: false,
    };

    const newTemplate = await HistoryTemplates.create(templateData);
    res.status(201).json({
      success: true,
      newTemplate,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllHistoryTemplates = async (req, res) => {
  try {
    // Base filter for user-specific templates
    const userFilter = {};

    if (req.user.role === "doctor") {
      // For doctors, get their own templates
      userFilter.doctorId = req.user.id;
    } else if (req.user.role === "admin") {
      // For admins, get admin templates
      userFilter.isAdmin = true;
    }

    // Get user-specific templates
    const userTemplates = await HistoryTemplates.find(userFilter);

    // Get admin templates (for doctors to also see admin templates)
    let adminTemplates = [];
    if (req.user.role === "doctor") {
      adminTemplates = await HistoryTemplates.find({ isAdmin: true });
    }

    // Return templates in a structured format
    if (req.user.role === "doctor") {
      res.json({
        myTemplates: userTemplates,
        defaultTemplates: adminTemplates,
      });
    } else {
      // For admins or other roles
      res.json(userTemplates);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getHistoryTemplateById = async (req, res) => {
  try {
    const template = await HistoryTemplates.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateHistoryTemplateByAdmin = async (req, res) => {
  try {
    const updatedTemplate = await HistoryTemplates.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedTemplate) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json(updatedTemplate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateHistoryTemplateByDoctor = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const template = await HistoryTemplates.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    if (template.doctorId.toString() !== doctorId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this template" });
    }

    const updatedTemplate = await HistoryTemplates.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      updatedTemplate,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteHistoryTemplateByAdmin = async (req, res) => {
  try {
    await HistoryTemplates.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteHistoryTemplateByDoctor = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const template = await HistoryTemplates.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    if (template.doctorId.toString() !== doctorId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this template" });
    }

    await HistoryTemplates.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
