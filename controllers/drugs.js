import Drug from "../models/Drug.js";
import Formulation from "../models/Formulation.js";

export const createFormulation = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required." });
    }

    const newFormulation = new Formulation({
      name,
    });

    await newFormulation.save();

    return res.status(201).json({
      message: "Formulation created successfully.",
      data: newFormulation,
    });
  } catch (error) {
    console.error("Error creating formulation:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

export const createDrug = async (req, res) => {
  try {
    const newDrug = new Drug(req.body);
    const savedDrug = await newDrug.save();
    res.status(201).json(savedDrug);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create drug", error: error.message });
  }
};

export const getAllDrugs = async (req, res) => {
  try {
    const drugs = await Drug.find().populate("formulation");
    res.status(200).json(drugs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch drugs", error: error.message });
  }
};

export const getDrugById = async (req, res) => {
  try {
    const { id } = req.params;
    const drug = await Drug.findById(id).populate("formulation");
    if (!drug) return res.status(404).json({ message: "Drug not found" });
    res.status(200).json(drug);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch drug", error: error.message });
  }
};

// @desc    Update a drug
export const updateDrug = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedDrug = await Drug.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedDrug)
      return res.status(404).json({ message: "Drug not found" });
    res.status(200).json(updatedDrug);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update drug", error: error.message });
  }
};

// @desc    Delete a drug
export const deleteDrug = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDrug = await Drug.findByIdAndDelete(id);
    if (!deletedDrug)
      return res.status(404).json({ message: "Drug not found" });
    res.status(200).json({ message: "Drug deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete drug", error: error.message });
  }
};
