import TemplateAssets from "../models/TemplateAssets.js";
import TemplateList from "../models/TemplateList.js";
import TemplateAttributes from "../models/TemplateAttrbutes.js";
import Vitals from "../models/Vitals.js";
import { capitalize } from "../utils/string-methods.js";
import mongoose from "mongoose";

export const createTemplateList = async (req, res) => {
  try {
    const { name, defaultSelection = false } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required." });
    }

    const newTemplate = new TemplateList({
      name: capitalize(name),
      defaultSelection,
    });

    await newTemplate.save();

    return res.status(201).json({
      message: "Template list created successfully.",
      data: newTemplate,
    });
  } catch (error) {
    console.error("Error creating template list:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// Delete a template list by ID
export const deleteTemplateList = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await TemplateList.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Template list not found." });
    }

    return res.status(200).json({
      message: "Template list deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting template list:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

export const setDefaultTemplateList = async (req, res) => {
  try {
    const { id } = req.params;

    const targetTemplate = await TemplateList.findById(id);

    if (!targetTemplate) {
      return res.status(404).json({ message: "Template list not found." });
    }

    const isCurrentlyDefault = targetTemplate.defaultSelection;

    if (isCurrentlyDefault) {
      // If it's already default, unset it (toggle off)
      targetTemplate.defaultSelection = false;
      await targetTemplate.save();

      return res.status(200).json({
        message: "Template list unset as default.",
        data: targetTemplate,
      });
    } else {
      // Unset all others
      await TemplateList.updateMany(
        { _id: { $ne: id }, defaultSelection: true },
        { $set: { defaultSelection: false } }
      );

      // Set current as default (toggle on)
      targetTemplate.defaultSelection = true;
      await targetTemplate.save();

      return res.status(200).json({
        message: "Template list set as default.",
        data: targetTemplate,
      });
    }
  } catch (error) {
    console.error("Error toggling default template list:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

export const createTemplateAssets = async (req, res) => {
  try {
    const {
      selectedTemplate,
      previewUrl,
      letterheadAndDegree,
      templateConfig,
    } = req.body;

    const doctorId = req.user.id;

    if (!selectedTemplate || !previewUrl) {
      return res
        .status(400)
        .json({ message: "selectedTemplate and previewUrl are required" });
    }

    const newTemplate = await TemplateAssets.create({
      selectedTemplate,
      doctorId,
      previewUrl,
      letterheadAndDegree,
      templateConfig,
    });

    return res.status(201).json(newTemplate);
  } catch (error) {
    console.error("Error creating template with assets:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete a TemplateWithAssets document by ID
 */
export const deleteTemplateAssets = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTemplate = await TemplateAssets.findByIdAndDelete(id);

    if (!deletedTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    return res.status(200).json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template with assets:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createTemplateAttributes = async (req, res) => {
  try {
    const { clinicId, ...rest } = req.body;

    const doctorId = req.user.id;

    // Check if a record already exists for this clinic-doctor combination
    const existing = await TemplateAttributes.findOne({ clinicId, doctorId });
    if (existing) {
      return res.status(400).json({
        message: "Template already exists for this doctor and clinic",
      });
    }

    const newTemplate = await TemplateAttributes.create({
      clinicId,
      doctorId,
      ...rest,
    });

    res
      .status(201)
      .json({ message: "Template attributes created", data: newTemplate });
  } catch (error) {
    console.error("Error creating template attributes:", error);
    res
      .status(500)
      .json({ message: "Server error while creating template attributes" });
  }
};

export const updateTemplateAttributes = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const doctorId = req.user.id;
    const updates = req.body;

    const existing = await TemplateAttributes.findOne({ clinicId });

    if (!existing.doctorId || existing.doctorId.toString() !== doctorId) {
      return res.status(404).json({
        message: "You are not authorized to update this template attributes",
      });
    }

    const updated = await TemplateAttributes.findOneAndUpdate(
      { clinicId, doctorId },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Template not found for this doctor and clinic" });
    }

    res
      .status(200)
      .json({ message: "Template attributes updated", data: updated });
  } catch (error) {
    console.error("Error updating template attributes:", error);
    res
      .status(500)
      .json({ message: "Server error while updating template attributes" });
  }
};

// vitals

export const createCustomVitals = async (req, res) => {
  try {
    const { vitalName, unit } = req.body;

    if (!vitalName || !unit) {
      return res
        .status(400)
        .json({ message: "vitalName and unit are required" });
    }

    const existing = await Vitals.findOne({ vitalName });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Vital with this name already exists" });
    }

    const vital = await Vitals.create({ vitalName, unit });
    res.status(201).json(vital);
  } catch (error) {
    console.error("Error creating vital:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCustomVitals = async (req, res) => {
  try {
    const vitals = await Vitals.find().sort({
      createdAt: -1,
      vitalName: 1,
    });
    res.status(200).json(vitals);
  } catch (error) {
    console.error("Error fetching vitals:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateCustomVitals = async (req, res) => {
  try {
    const { id } = req.params;
    const { vitalName, unit } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid vital ID" });
    }

    const updatedVital = await Vitals.findByIdAndUpdate(
      id,
      { vitalName, unit },
      { new: true, runValidators: true }
    );

    if (!updatedVital) {
      return res.status(404).json({ message: "Vital not found" });
    }

    res.status(200).json(updatedVital);
  } catch (error) {
    console.error("Error updating vital:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteCustomVitals = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid vital ID" });
    }

    const deleted = await Vitals.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Vital not found" });
    }

    res.status(200).json({ message: "Vital deleted successfully" });
  } catch (error) {
    console.error("Error deleting vital:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
