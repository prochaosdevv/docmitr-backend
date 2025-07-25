// controllers/labLocationController.ts

import LabLocation from "../models/Lablocation.js";

// Create
export const createLabLocation = async (req, res) => {
  try {
    const lab = await LabLocation.create(req.body);
    res.status(201).json({ success: true, data: lab });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All
export const getAllLabLocations = async (req, res) => {
  try {
    const labs = await LabLocation.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: labs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get One
export const getLabLocationById = async (req, res) => {
  try {
    const lab = await LabLocation.findById(req.params.id);
    if (!lab)
      return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({ success: true, data: lab });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update
export const updateLabLocation = async (req, res) => {
  try {
    const lab = await LabLocation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!lab)
      return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({ success: true, data: lab });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete
export const deleteLabLocation = async (req, res) => {
  try {
    const lab = await LabLocation.findByIdAndDelete(req.params.id);
    if (!lab)
      return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
