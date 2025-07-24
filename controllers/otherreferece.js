import mongoose from "mongoose";
import OtherReferences from "../models/OtherReferences.js";

// CREATE
export const createOtherReference = async (req, res) => {
  try {
    const { testName, doctorId, patientId, date, status, type } = req.body;

    console.log("Creating other reference with data:", req.body);

    // check if doctorId and patientId is valid mongoose ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(doctorId) ||
      !mongoose.Types.ObjectId.isValid(patientId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid doctor or patient ID" });
    }

    await OtherReferences.create({
      testName,
      doctorId,
      patientId,
      date,
      status,
      type,
    });

    res.status(201).json({
      success: true,
      message: "Reference created successfully",
    });
  } catch (error) {
    console.log("Error creating other reference:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// READ ALL
export const getAllOtherReferences = async (req, res) => {
  try {
    const { type } = req.query;

    const references = await OtherReferences.find(type ? { type } : {})
      .populate("doctorId", "firstName lastName") // Adjust fields as per your Doctor schema
      .populate("patientId", "name");

    res.status(200).json({ success: true, data: references });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// READ ONE
export const getOtherReferenceById = async (req, res) => {
  try {
    const reference = await OtherReferences.findById(req.params.id)
      .populate("doctorId", "firstName lastName")
      .populate("patientId", "name");

    if (!reference) {
      return res
        .status(404)
        .json({ success: false, message: "Reference not found" });
    }

    res.status(200).json({ success: true, data: reference });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// UPDATE
export const updateOtherReference = async (req, res) => {
  try {
    const updated = await OtherReferences.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Reference not found" });
    }

    res.status(200).json({
      success: true,
      message: "Reference updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// DELETE
export const deleteOtherReference = async (req, res) => {
  try {
    const deleted = await OtherReferences.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Reference not found" });
    }

    res.status(200).json({
      success: true,
      message: "Reference deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
