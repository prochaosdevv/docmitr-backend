import mongoose from "mongoose";
import DiagnosisProperties from "../models/DiagnosisProperties.js";
import Findings from "../models/Findings.js";
import FindingsProperties from "../models/FindingsProperties.js";
import Symptoms from "../models/Symptoms.js";
import SymptomsProperties from "../models/SymptomsProperties.js";
import Diagnosis from "../models/Diagnosis.js";
import Investigation, { InvestigationPanel } from "../models/Investigation.js";
import Instructions from "../models/Instructions.js";
import Procedures from "../models/Procedures.js";
import Medicine from "../models/Medicine.js";
import Composition from "../models/Composition.js";
import MedicineCategory from "../models/MedicineCategory.js";
import PatientSymptoms from "../models/PatientSymptoms.js";
import TemplateList from "../models/TemplateList.js";
import { PrescriptionItem } from "../models/PatientMedicine.js";
import PatientInvestigation from "../models/PatientInvestigation.js";
import DosageCalculatorSchema from "../models/DosageCalculatorSchema.js";
import Report from "../models/Reports.js";
import Appoinment from "../models/Appoinment.js";
import ProcedureLocation from "../models/ProcedureLocation.js";
import Doctor from "../models/Doctor.js";
import Allergy from "../models/Allergy.js";

export const createSymptomByAdmin = async (req, res) => {
  try {
    const { name } = req.body;

    const admin = req.user;

    if (!name) {
      return res.status(400).json({ message: "Symptom name is required" });
    }

    const newSymptom = await Symptoms.create({
      name,
      doctorId: null,
      isAdmin: admin.role === "admin" ? true : false,
    });

    res.status(201).json(newSymptom);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createSymptomByDoctor = async (req, res) => {
  try {
    const { name } = req.body;

    const doctorId = req.user.id;

    if (!name) {
      return res.status(400).json({ message: "Symptom name is required" });
    }

    const newSymptom = await Symptoms.create({
      name,
      doctorId,
      isAdmin: false,
    });

    res.status(201).json({
      success: true,
      newSymptom,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllSymptoms = async (req, res) => {
  try {
    const { id, role } = req.user; // coming from JWT middleware

    let filter = {};

    if (role === "admin") {
      // Admin: show only global symptoms created by admins
      filter = { isAdmin: true };
    } else if (role === "doctor") {
      // Doctor: show only their own symptoms
      filter = {
        $or: [{ isAdmin: true }, { doctorId: id }],
      };
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    const symptoms = await Symptoms.find(filter).sort({ createdAt: -1 });
    res.status(200).json(symptoms);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createSymptomPropertyByAdmin = async (req, res) => {
  try {
    const { symptopId, details } = req.body;

    const admin = req.user;

    // Validate symptopId
    if (!symptopId || !mongoose.Types.ObjectId.isValid(symptopId)) {
      return res.status(400).json({ message: "Valid symptopId is required." });
    }

    // Validate details (should be a non-empty array)
    if (!Array.isArray(details) || details.length === 0) {
      return res
        .status(400)
        .json({ message: "details must be a non-empty array." });
    }

    const newEntry = new SymptomsProperties({
      symptopId,
      doctorId: null,
      isAdmin: admin.role === "admin" ? true : false,
      details,
    });

    const savedEntry = await newEntry.save();
    return res.status(201).json({
      message: "Symptom properties created successfully.",
      data: savedEntry,
    });
  } catch (error) {
    console.error("Error creating SymptomsProperties:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const createSymptomPropertyByDoctor = async (req, res) => {
  try {
    const { symptopId, details } = req.body;
    const doctorId = req.user?.id;

    // Validate symptopId
    if (!symptopId || !mongoose.Types.ObjectId.isValid(symptopId)) {
      return res.status(400).json({ message: "Valid symptopId is required." });
    }

    // Validate doctorId
    if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
      return res
        .status(401)
        .json({ message: "Unauthorized: valid doctorId required." });
    }

    // Validate details (should be a non-empty array)
    if (!Array.isArray(details) || details.length === 0) {
      return res
        .status(400)
        .json({ message: "details must be a non-empty array." });
    }

    const newEntry = new SymptomsProperties({
      symptopId,
      doctorId,
      isAdmin: false,
      details,
    });

    const savedEntry = await newEntry.save();

    return res.status(201).json({
      message: "Symptom properties created successfully.",
      data: savedEntry,
    });
  } catch (error) {
    console.error("Error creating SymptomsProperties:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const addOnSymptomProperties = async (req, res) => {
  try {
    const { symptomId, symptopId, details } = req.body;
    const finalId = symptopId || symptomId;

    const user = req.user;

    if (!finalId || !Array.isArray(details)) {
      return res
        .status(400)
        .json({ message: "symptopId and valid details array are required." });
    }

    const filter = {
      symptopId: finalId,
      doctorId: user.role === "doctor" ? user.id : null,
      isAdmin: user.role === "admin" ? true : false,
    };

    const existingEntry = await SymptomsProperties.findOne(filter);

    if (existingEntry) {
      // Append new categories, avoid duplicates by categoryName
      const existingCategories = existingEntry.details.map(
        (c) => c.categoryName
      );

      details.forEach((newCategory) => {
        if (!existingCategories.includes(newCategory.categoryName)) {
          existingEntry.details.push(newCategory);
        } else {
          // Optionally: merge properties inside existing category (if needed)
          const existingCategory = existingEntry.details.find(
            (c) => c.categoryName === newCategory.categoryName
          );
          // Merge categoryProperties inside the existing category
          newCategory.categoryProperties.forEach((newProp) => {
            const exists = existingCategory.categoryProperties.some(
              (p) => p.propertyName === newProp.propertyName
            );
            if (!exists) {
              existingCategory.categoryProperties.push(newProp);
            }
            // If you want to update existing properties, handle that here
          });
        }
      });

      const updatedEntry = await existingEntry.save();
      return res.status(200).json({
        message: "Symptom properties updated successfully.",
        data: updatedEntry,
      });
    } else {
      // Create new entry
      const newEntry = new SymptomsProperties({
        symptopId: finalId,
        details,
        doctorId: user.role === "doctor" ? user.id : null,
        isAdmin: user.role === "admin" ? true : false,
      });
      const savedEntry = await newEntry.save();
      return res.status(201).json({
        message: "Symptom properties created successfully.",
        data: savedEntry,
      });
    }
  } catch (error) {
    console.error("Error creating or updating SymptomsProperties:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const deleteSymptomCategory = async (req, res) => {
  try {
    const { symptopId, categoryId } = req.query; // categoryId is the _id of the category object in details
    const user = req.user;

    if (!symptopId || !categoryId) {
      return res
        .status(400)
        .json({ message: "symptopId and categoryId are required." });
    }

    const symptomProperty = await SymptomsProperties.findOne({
      symptopId,
      doctorId: user.role === "doctor" ? user.id : null,
      isAdmin: user.role === "admin" ? true : false,
    });

    if (!symptomProperty) {
      return res.status(404).json({ message: "Symptom property not found." });
    }

    // Find index of the category with _id === categoryId (string compare, so convert ObjectId to string)
    const categoryIndex = symptomProperty.details.findIndex(
      (category) => category._id.toString() === categoryId
    );

    if (categoryIndex === -1) {
      return res
        .status(400)
        .json({ message: "Category with given id not found in details." });
    }

    // Remove that category from details array
    symptomProperty.details.splice(categoryIndex, 1);

    symptomProperty.markModified("details");

    await symptomProperty.save();

    return res.status(200).json({
      message: `Category with id '${categoryId}' deleted successfully.`,
      data: symptomProperty,
    });
  } catch (error) {
    console.error("Error deleting symptom category:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const editSymptomProperty = async (req, res) => {
  try {
    const { symptopId, details, renameCategoryId, renameCategoryTo } = req.body;
    const user = req.user;

    if (!symptopId || !Array.isArray(details)) {
      return res.status(400).json({
        message: "symptopId and valid details array are required.",
      });
    }

    const symptomProperty = await SymptomsProperties.findOne({
      symptopId,
      // doctorId: user.role === "doctor" ? user.id : null,
      // isAdmin: user.role === "admin" ? true : false,
    });

    if (!symptomProperty) {
      return res.status(404).json({ message: "Symptom property not found." });
    }

    // Clone current details
    let updatedDetails = [...symptomProperty.details];

    // 1. Rename category (if needed)
    if (renameCategoryId && typeof renameCategoryTo === "string") {
      const categoryIndex = updatedDetails.findIndex(
        (cat) => cat._id.toString() === renameCategoryId
      );
      if (categoryIndex === -1) {
        return res.status(400).json({
          message: `Category with id '${renameCategoryId}' not found.`,
        });
      }
      updatedDetails[categoryIndex].categoryName = renameCategoryTo.trim();
    }

    // 2. Handle category update
    details.forEach((newCategory) => {
      const categoryIndex = updatedDetails.findIndex(
        (cat) => cat._id.toString() === newCategory._id
      );

      if (categoryIndex !== -1) {
        const existingCategory = updatedDetails[categoryIndex];

        // Extract existing and incoming property IDs
        const incomingPropIds = newCategory.categoryProperties
          .filter((p) => p._id) // Only those with _id
          .map((p) => p._id.toString());

        // Filter out removed properties
        existingCategory.categoryProperties =
          existingCategory.categoryProperties.filter((p) =>
            incomingPropIds.includes(p._id?.toString())
          );

        // Now update or push each property
        newCategory.categoryProperties.forEach((newProp) => {
          const propIndex = existingCategory.categoryProperties.findIndex(
            (p) => p._id?.toString() === newProp._id
          );

          if (propIndex !== -1) {
            existingCategory.categoryProperties[propIndex] = {
              ...existingCategory.categoryProperties[propIndex],
              propertyName: newProp.propertyName,
              propertyValue: newProp.propertyValue,
            };
          } else {
            // New property (without _id)
            existingCategory.categoryProperties.push({
              propertyName: newProp.propertyName,
              propertyValue: newProp.propertyValue,
            });
          }
        });

        updatedDetails[categoryIndex] = existingCategory;
      } else {
        // Category not found, add it completely
        updatedDetails.push(newCategory);
      }
    });

    symptomProperty.details = updatedDetails;
    symptomProperty.markModified("details");
    await symptomProperty.save();

    return res.status(200).json({
      message: "Symptom properties updated successfully.",
      data: symptomProperty,
    });
  } catch (error) {
    console.error("Error editing symptom property:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getSymptomProperties = async (req, res) => {
  try {
    const { symptopId } = req.params;
    const user = req.user;

    if (!symptopId) {
      return res.status(400).json({ message: "symptopId is required." });
    }

    const symptom = await Symptoms.findById(symptopId);

    if (!symptom) {
      return res
        .status(200)
        .json({ message: "Symptom not found.", details: [] });
    }

    let filter = {
      symptopId,
      $or: [{ isAdmin: true }, { doctorId: user.id }],
    };

    // Get all matching symptom properties documents
    const symptomPropertiesList = await SymptomsProperties.find(filter)
      .sort({ createdAt: -1 })
      .populate("symptopId", "name")
      .populate("doctorId", "name");

    if (symptomPropertiesList.length === 0) {
      return res.status(200).json({
        message: "No properties found for this symptom.",
        details: [],
      });
    }

    // Combine all 'details' arrays from the documents
    const combinedCategoriesMap = new Map();

    symptomPropertiesList.forEach((symptomProp) => {
      symptomProp.details.forEach((category) => {
        if (!combinedCategoriesMap.has(category.categoryName)) {
          combinedCategoriesMap.set(category.categoryName, {
            categoryName: category.categoryName,
            _id: category._id,
            categoryProperties: [...category.categoryProperties],
          });
        } else {
          // Merge categoryProperties to avoid duplicates
          const existingCategory = combinedCategoriesMap.get(
            category.categoryName,
            category._id
          );

          category.categoryProperties.forEach((prop) => {
            const exists = existingCategory.categoryProperties.some(
              (p) => p.propertyName === prop.propertyName
            );
            if (!exists) {
              existingCategory.categoryProperties.push(prop);
            }
          });
        }
      });
    });

    const combinedCategories = Array.from(combinedCategoriesMap.values());

    return res.status(200).json({
      message: "Combined symptom properties fetched successfully.",
      details: combinedCategories,
    });
  } catch (error) {
    console.error("Error fetching SymptomsProperties:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const searchSymptoms = async (req, res) => {
  try {
    const { query } = req.query; // search query from request
    if (!query) {
      return res.status(400).json({ message: "Search query is required." });
    }
    // Use regex to perform case-insensitive search
    const symptoms = await Symptoms.find({
      name: { $regex: query, $options: "i" }, // case-insensitive search
    }).sort({ createdAt: -1 });
    if (symptoms.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(symptoms);
  } catch (error) {
    console.error("Error searching symptoms:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteSymptom = async (req, res) => {
  try {
    const { symptopId } = req.params; // Get symptomId from request params

    if (!symptopId || !mongoose.Types.ObjectId.isValid(symptopId)) {
      return res.status(400).json({ message: "Valid symptomId is required." });
    }

    // Check if the symptom exists
    const symptom = await Symptoms.findById(symptopId);
    if (!symptom) {
      return res.status(404).json({ message: "Symptom not found." });
    }

    // Delete the symptom
    await Symptoms.findByIdAndDelete(symptopId);

    // Also delete associated properties if any
    await SymptomsProperties.deleteMany({ symptopId: symptopId });

    res.status(200).json({ message: "Symptom deleted successfully." });
  } catch (error) {
    console.log("Error deleting symptom:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// findings

export const createFindingsByAdmin = async (req, res) => {
  try {
    const { name } = req.body;

    const admin = req.user;

    if (!name) {
      return res.status(400).json({ message: "Symptom name is required" });
    }

    const newFinding = await Findings.create({
      name,
      doctorId: null,
      isAdmin: admin.role === "admin" ? true : false,
    });

    res.status(201).json(newFinding);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createFindingsByDoctor = async (req, res) => {
  try {
    const { name } = req.body;

    const doctorId = req.user.id;

    if (!name) {
      return res.status(400).json({ message: "Symptom name is required" });
    }

    const newFinding = await Findings.create({
      name,
      doctorId,
      isAdmin: false,
    });

    res.status(201).json({
      success: true,
      newFinding,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllFindings = async (req, res) => {
  try {
    const { id, role } = req.user; // coming from JWT middleware

    let filter = {};

    if (role === "admin") {
      // Admin: show only global symptoms created by admins
      filter = { isAdmin: true };
    } else if (role === "doctor") {
      // Doctor: show only their own symptoms
      filter = {
        $or: [{ isAdmin: true }, { doctorId: id }],
      };
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    const symptoms = await Findings.find(filter).sort({ createdAt: -1 });
    res.status(200).json(symptoms);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createFindingPropertyByAdmin = async (req, res) => {
  try {
    const { findingsId, details } = req.body;

    const admin = req.user;

    if (!findingsId || !mongoose.Types.ObjectId.isValid(findingsId)) {
      return res.status(400).json({ message: "Valid findingsId is required." });
    }

    if (!Array.isArray(details) || details.length === 0) {
      return res
        .status(400)
        .json({ message: "details must be a non-empty array." });
    }

    const newEntry = new FindingsProperties({
      findingsId,
      doctorId: null,
      isAdmin: admin.role === "admin" ? true : false,
      details,
    });

    const savedEntry = await newEntry.save();
    return res.status(201).json({
      message: "Findings properties created successfully.",
      data: savedEntry,
    });
  } catch (error) {
    console.error("Error creating FindingsProperties:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const createFindingPropertyByDoctor = async (req, res) => {
  try {
    const { findingsId, details } = req.body;
    const doctorId = req.user?.id;

    if (!findingsId || !mongoose.Types.ObjectId.isValid(findingsId)) {
      return res.status(400).json({ message: "Valid findingsId is required." });
    }

    if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
      return res
        .status(401)
        .json({ message: "Unauthorized: valid doctorId required." });
    }

    if (!Array.isArray(details) || details.length === 0) {
      return res
        .status(400)
        .json({ message: "details must be a non-empty array." });
    }

    const newEntry = new FindingsProperties({
      findingsId,
      doctorId,
      isAdmin: false,
      details,
    });

    const savedEntry = await newEntry.save();

    return res.status(201).json({
      message: "Finding properties created successfully.",
      data: savedEntry,
    });
  } catch (error) {
    console.error("Error creating FindingProperties:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const addOnFindingsProperties = async (req, res) => {
  try {
    const { findingsId, details } = req.body;
    const finalId = findingsId;

    const user = req.user;

    if (!finalId || !Array.isArray(details)) {
      return res
        .status(400)
        .json({ message: "findingsId and valid details array are required." });
    }

    const filter = {
      findingsId: finalId,
      doctorId: user.role === "doctor" ? user.id : null,
      isAdmin: user.role === "admin" ? true : false,
    };

    const existingEntry = await FindingsProperties.findOne(filter);

    if (existingEntry) {
      // Append new categories, avoid duplicates by categoryName
      const existingCategories = existingEntry.details.map(
        (c) => c.categoryName
      );

      details.forEach((newCategory) => {
        if (!existingCategories.includes(newCategory.categoryName)) {
          existingEntry.details.push(newCategory);
        } else {
          // Optionally: merge properties inside existing category (if needed)
          const existingCategory = existingEntry.details.find(
            (c) => c.categoryName === newCategory.categoryName
          );
          // Merge categoryProperties inside the existing category
          newCategory.categoryProperties.forEach((newProp) => {
            const exists = existingCategory.categoryProperties.some(
              (p) => p.propertyName === newProp.propertyName
            );
            if (!exists) {
              existingCategory.categoryProperties.push(newProp);
            }
            // If you want to update existing properties, handle that here
          });
        }
      });

      const updatedEntry = await existingEntry.save();
      return res.status(200).json({
        message: "Fidnings properties updated successfully.",
        data: updatedEntry,
      });
    } else {
      // Create new entry
      const newEntry = new FindingsProperties({
        findingsId: finalId,
        details,
        doctorId: user.role === "doctor" ? user.id : null,
        isAdmin: user.role === "admin" ? true : false,
      });
      const savedEntry = await newEntry.save();
      return res.status(201).json({
        message: "Findings properties created successfully.",
        data: savedEntry,
      });
    }
  } catch (error) {
    console.error("Error creating or updating FindingsProperties:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const deleteFindingsCategory = async (req, res) => {
  try {
    const { findingsId, categoryId } = req.query; // categoryId is the _id of the category object in details
    const user = req.user;

    if (!findingsId || !categoryId) {
      return res
        .status(400)
        .json({ message: "findingsId and categoryId are required." });
    }

    const symptomProperty = await FindingsProperties.findOne({
      findingsId,
      doctorId: user.role === "doctor" ? user.id : null,
      isAdmin: user.role === "admin" ? true : false,
    });

    if (!symptomProperty) {
      return res.status(404).json({ message: "Finding property not found." });
    }

    // Find index of the category with _id === categoryId (string compare, so convert ObjectId to string)
    const categoryIndex = symptomProperty.details.findIndex(
      (category) => category._id.toString() === categoryId
    );

    if (categoryIndex === -1) {
      return res
        .status(400)
        .json({ message: "Category with given id not found in details." });
    }

    // Remove that category from details array
    symptomProperty.details.splice(categoryIndex, 1);

    symptomProperty.markModified("details");

    await symptomProperty.save();

    return res.status(200).json({
      message: `Category with id '${categoryId}' deleted successfully.`,
      data: symptomProperty,
    });
  } catch (error) {
    console.error("Error deleting finding category:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const editFindingsProperty = async (req, res) => {
  try {
    const { findingsId, details, renameCategoryId, renameCategoryTo } =
      req.body;
    const user = req.user;

    if (!findingsId || !Array.isArray(details)) {
      return res.status(400).json({
        message: "findingsId and valid details array are required.",
      });
    }

    const findingProperty = await FindingsProperties.findOne({
      findingsId,
      // doctorId: user.role === "doctor" ? user.id : null,
      // isAdmin: user.role === "admin" ? true : false,
    });

    if (!findingProperty) {
      return res.status(404).json({ message: "Finding property not found." });
    }

    // Clone current details
    let updatedDetails = [...findingProperty.details];

    // 1. Rename category (if provided)
    if (renameCategoryId && typeof renameCategoryTo === "string") {
      const categoryIndex = updatedDetails.findIndex(
        (cat) => cat._id.toString() === renameCategoryId
      );
      if (categoryIndex === -1) {
        return res.status(400).json({
          message: `Category with id '${renameCategoryId}' not found.`,
        });
      }
      updatedDetails[categoryIndex].categoryName = renameCategoryTo.trim();
    }

    // 2. Update category data
    details.forEach((newCategory) => {
      const categoryIndex = updatedDetails.findIndex(
        (cat) => cat._id.toString() === newCategory._id
      );

      if (categoryIndex !== -1) {
        const existingCategory = updatedDetails[categoryIndex];

        // Prepare list of new prop IDs
        const incomingPropIds = newCategory.categoryProperties
          .filter((p) => p._id)
          .map((p) => p._id.toString());

        // 🗑️ Remove deleted properties
        existingCategory.categoryProperties =
          existingCategory.categoryProperties.filter((p) =>
            incomingPropIds.includes(p._id?.toString())
          );

        // Update or add each property
        newCategory.categoryProperties.forEach((newProp) => {
          const propIndex = existingCategory.categoryProperties.findIndex(
            (p) => p._id?.toString() === newProp._id
          );

          if (propIndex !== -1) {
            // Update existing
            existingCategory.categoryProperties[propIndex] = {
              ...existingCategory.categoryProperties[propIndex],
              propertyName: newProp.propertyName,
              propertyValue: newProp.propertyValue,
            };
          } else {
            // Add new property
            existingCategory.categoryProperties.push({
              propertyName: newProp.propertyName,
              propertyValue: newProp.propertyValue,
            });
          }
        });

        updatedDetails[categoryIndex] = existingCategory;
      } else {
        // ➕ New category
        updatedDetails.push(newCategory);
      }
    });

    findingProperty.details = updatedDetails;
    findingProperty.markModified("details");
    await findingProperty.save();

    return res.status(200).json({
      message: "Finding properties updated successfully.",
      data: findingProperty,
    });
  } catch (error) {
    console.error("Error editing finding property:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getFindingsProperties = async (req, res) => {
  try {
    const { findingsId } = req.params;
    const user = req.user;

    if (!findingsId) {
      return res.status(400).json({ message: "findingsId is required." });
    }

    const symptom = await Findings.findById(findingsId);

    if (!symptom) {
      return res
        .status(200)
        .json({ message: "Finding not found.", details: [] });
    }

    let filter = {
      findingsId,
      $or: [{ isAdmin: true }, { doctorId: user.id }],
    };

    // Get all matching symptom properties documents
    const symptomPropertiesList = await FindingsProperties.find(filter)
      .sort({ createdAt: -1 })
      .populate("findingsId", "name")
      .populate("doctorId", "name");

    if (symptomPropertiesList.length === 0) {
      return res.status(200).json({
        message: "No properties found for this finding.",
        details: [],
      });
    }

    // Combine all 'details' arrays from the documents
    const combinedCategoriesMap = new Map();

    symptomPropertiesList.forEach((symptomProp) => {
      symptomProp.details.forEach((category) => {
        if (!combinedCategoriesMap.has(category.categoryName)) {
          combinedCategoriesMap.set(category.categoryName, {
            categoryName: category.categoryName,
            _id: category._id,
            categoryProperties: [...category.categoryProperties],
          });
        } else {
          // Merge categoryProperties to avoid duplicates
          const existingCategory = combinedCategoriesMap.get(
            category.categoryName,
            category._id
          );

          category.categoryProperties.forEach((prop) => {
            const exists = existingCategory.categoryProperties.some(
              (p) => p.propertyName === prop.propertyName
            );
            if (!exists) {
              existingCategory.categoryProperties.push(prop);
            }
          });
        }
      });
    });

    const combinedCategories = Array.from(combinedCategoriesMap.values());

    return res.status(200).json({
      message: "Combined findings properties fetched successfully.",
      details: combinedCategories,
    });
  } catch (error) {
    console.error("Error fetching FindingsProperties:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const searchFindings = async (req, res) => {
  try {
    const { query } = req.query; // search query from request
    if (!query) {
      return res.status(400).json({ message: "Search query is required." });
    }
    // Use regex to perform case-insensitive search
    const symptoms = await Findings.find({
      name: { $regex: query, $options: "i" }, // case-insensitive search
    }).sort({ createdAt: -1 });
    if (symptoms.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(symptoms);
  } catch (error) {
    console.error("Error searching findings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteFinding = async (req, res) => {
  try {
    const { findingsId } = req.params; // Get symptomId from request params

    if (!findingsId || !mongoose.Types.ObjectId.isValid(findingsId)) {
      return res.status(400).json({ message: "Valid findingsId is required." });
    }

    // Check if the symptom exists
    const symptom = await Findings.findById(findingsId);
    if (!symptom) {
      return res.status(404).json({ message: "Findings not found." });
    }

    // Delete the symptom
    await Findings.findByIdAndDelete(findingsId);

    // Also delete associated properties if any
    await FindingsProperties.deleteMany({ findingsId: findingsId });

    res.status(200).json({ message: "Findings deleted successfully." });
  } catch (error) {
    console.log("Error deleting findings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// diagnosis

export const createDiagnosisByAdmin = async (req, res) => {
  try {
    const { name } = req.body;

    const admin = req.user;

    if (!name) {
      return res.status(400).json({ message: "Diagnosis name is required" });
    }

    const newDiagnosis = await Diagnosis.create({
      name,
      doctorId: null,
      isAdmin: admin.role === "admin" ? true : false,
    });

    res.status(201).json(newDiagnosis);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createDiagnosisByDoctor = async (req, res) => {
  try {
    const { name } = req.body;

    const doctorId = req.user.id;

    if (!name) {
      return res.status(400).json({ message: "Diagnosis name is required" });
    }

    const newDiagnosis = await Diagnosis.create({
      name,
      doctorId,
      isAdmin: false,
    });

    res.status(201).json({
      success: true,
      newDiagnosis,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllDiagnosis = async (req, res) => {
  try {
    const { id, role } = req.user; // coming from JWT middleware

    let filter = {};

    if (role === "admin") {
      // Admin: show only global symptoms created by admins
      filter = { isAdmin: true };
    } else if (role === "doctor") {
      filter = {
        $or: [{ isAdmin: true }, { doctorId: id }],
      };
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    const symptoms = await Diagnosis.find(filter).sort({ createdAt: -1 });
    res.status(200).json(symptoms);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createDiagnosisPropertyByAdmin = async (req, res) => {
  try {
    const { diagnosisId, details } = req.body;

    const admin = req.user;

    if (!diagnosisId || !mongoose.Types.ObjectId.isValid(diagnosisId)) {
      return res
        .status(400)
        .json({ message: "Valid diagnosisId is required." });
    }

    if (!Array.isArray(details) || details.length === 0) {
      return res
        .status(400)
        .json({ message: "details must be a non-empty array." });
    }

    const newEntry = new DiagnosisProperties({
      diagnosisId,
      doctorId: null,
      isAdmin: admin.role === "admin" ? true : false,
      details,
    });

    const savedEntry = await newEntry.save();
    return res.status(201).json({
      message: "Diagnosis properties created successfully.",
      data: savedEntry,
    });
  } catch (error) {
    console.error("Error creating DiagnosisProperties:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const createDiagnosisPropertyByDoctor = async (req, res) => {
  try {
    const { diagnosisId, details } = req.body;
    const doctorId = req.user?.id;

    if (!diagnosisId || !mongoose.Types.ObjectId.isValid(diagnosisId)) {
      return res
        .status(400)
        .json({ message: "Valid diagnosisId is required." });
    }

    if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
      return res
        .status(401)
        .json({ message: "Unauthorized: valid doctorId required." });
    }

    if (!Array.isArray(details) || details.length === 0) {
      return res
        .status(400)
        .json({ message: "details must be a non-empty array." });
    }

    const newEntry = new DiagnosisProperties({
      diagnosisId,
      doctorId,
      isAdmin: false,
      details,
    });

    const savedEntry = await newEntry.save();

    return res.status(201).json({
      message: "Diagnosis properties created successfully.",
      data: savedEntry,
    });
  } catch (error) {
    console.error("Error creating DiagnosisProperties:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const addOnDiagnosisProperties = async (req, res) => {
  try {
    const { diagnosisId, details } = req.body;
    const finalId = diagnosisId;

    const user = req.user;

    if (!finalId || !Array.isArray(details)) {
      return res
        .status(400)
        .json({ message: "diagnosisId and valid details array are required." });
    }

    const filter = {
      diagnosisId: finalId,
      doctorId: user.role === "doctor" ? user.id : null,
      isAdmin: user.role === "admin" ? true : false,
    };

    const existingEntry = await DiagnosisProperties.findOne(filter);

    if (existingEntry) {
      // Append new categories, avoid duplicates by categoryName
      const existingCategories = existingEntry.details.map(
        (c) => c.categoryName
      );

      details.forEach((newCategory) => {
        if (!existingCategories.includes(newCategory.categoryName)) {
          existingEntry.details.push(newCategory);
        } else {
          // Optionally: merge properties inside existing category (if needed)
          const existingCategory = existingEntry.details.find(
            (c) => c.categoryName === newCategory.categoryName
          );
          // Merge categoryProperties inside the existing category
          newCategory.categoryProperties.forEach((newProp) => {
            const exists = existingCategory.categoryProperties.some(
              (p) => p.propertyName === newProp.propertyName
            );
            if (!exists) {
              existingCategory.categoryProperties.push(newProp);
            }
            // If you want to update existing properties, handle that here
          });
        }
      });

      const updatedEntry = await existingEntry.save();
      return res.status(200).json({
        message: "Diagnosis properties updated successfully.",
        data: updatedEntry,
      });
    } else {
      // Create new entry
      const newEntry = new DiagnosisProperties({
        diagnosisId: finalId,
        details,
        doctorId: user.role === "doctor" ? user.id : null,
        isAdmin: user.role === "admin" ? true : false,
      });
      const savedEntry = await newEntry.save();
      return res.status(201).json({
        message: "Diagnosis properties created successfully.",
        data: savedEntry,
      });
    }
  } catch (error) {
    console.error("Error creating or updating DiagnosisProperties:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const deleteDiagnosisCategory = async (req, res) => {
  try {
    const { diagnosisId, categoryId } = req.query; // categoryId is the _id of the category object in details
    const user = req.user;

    if (!diagnosisId || !categoryId) {
      return res
        .status(400)
        .json({ message: "diagnosisId and categoryId are required." });
    }

    const symptomProperty = await DiagnosisProperties.findOne({
      diagnosisId,
      doctorId: user.role === "doctor" ? user.id : null,
      isAdmin: user.role === "admin" ? true : false,
    });

    if (!symptomProperty) {
      return res.status(404).json({ message: "Diagnosis property not found." });
    }

    // Find index of the category with _id === categoryId (string compare, so convert ObjectId to string)
    const categoryIndex = symptomProperty.details.findIndex(
      (category) => category._id.toString() === categoryId
    );

    if (categoryIndex === -1) {
      return res
        .status(400)
        .json({ message: "Category with given id not found in details." });
    }

    // Remove that category from details array
    symptomProperty.details.splice(categoryIndex, 1);

    symptomProperty.markModified("details");

    await symptomProperty.save();

    return res.status(200).json({
      message: `Category with id '${categoryId}' deleted successfully.`,
      data: symptomProperty,
    });
  } catch (error) {
    console.error("Error deleting diagnosis category:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const editDiagnosisProperty = async (req, res) => {
  try {
    const { diagnosisId, details, renameCategoryId, renameCategoryTo } =
      req.body;
    const user = req.user;

    if (!diagnosisId || !Array.isArray(details)) {
      return res.status(400).json({
        message: "diagnosisId and valid details array are required.",
      });
    }

    const diagnosisProperty = await DiagnosisProperties.findOne({
      diagnosisId,
      doctorId: user.role === "doctor" ? user.id : null,
      isAdmin: user.role === "admin" ? true : false,
    });

    if (!diagnosisProperty) {
      return res.status(404).json({ message: "Diagnosis property not found." });
    }

    let updatedDetails = [...diagnosisProperty.details];

    // 1. Rename category if needed
    if (renameCategoryId && renameCategoryTo) {
      const categoryIndex = updatedDetails.findIndex(
        (cat) => cat._id.toString() === renameCategoryId
      );
      if (categoryIndex === -1) {
        return res.status(400).json({
          message: `Category with id '${renameCategoryId}' not found.`,
        });
      }
      updatedDetails[categoryIndex].categoryName = renameCategoryTo.trim();
    }

    // 2. Process category updates
    details.forEach((newCategory) => {
      const categoryIndex = updatedDetails.findIndex(
        (cat) => cat._id.toString() === newCategory._id
      );

      if (categoryIndex !== -1) {
        const existingCategory = updatedDetails[categoryIndex];

        // Collect incoming property IDs (that should remain)
        const incomingPropIds = newCategory.categoryProperties
          .filter((p) => p._id)
          .map((p) => p._id.toString());

        // 🗑️ Remove properties that no longer exist
        existingCategory.categoryProperties =
          existingCategory.categoryProperties.filter((p) =>
            incomingPropIds.includes(p._id?.toString())
          );

        // Update or add each property
        newCategory.categoryProperties.forEach((newProp) => {
          const propIndex = existingCategory.categoryProperties.findIndex(
            (p) => p._id?.toString() === newProp._id
          );

          if (propIndex !== -1) {
            // Update
            existingCategory.categoryProperties[propIndex] = {
              ...existingCategory.categoryProperties[propIndex],
              propertyName: newProp.propertyName,
              propertyValue: newProp.propertyValue,
            };
          } else {
            // Add
            existingCategory.categoryProperties.push({
              propertyName: newProp.propertyName,
              propertyValue: newProp.propertyValue,
            });
          }
        });

        updatedDetails[categoryIndex] = existingCategory;
      } else {
        // ➕ Add new category
        updatedDetails.push(newCategory);
      }
    });

    diagnosisProperty.details = updatedDetails;
    diagnosisProperty.markModified("details");
    await diagnosisProperty.save();

    return res.status(200).json({
      message: "Diagnosis properties updated successfully.",
      data: diagnosisProperty,
    });
  } catch (error) {
    console.error("Error editing diagnosis property:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getDiagnosisProperties = async (req, res) => {
  try {
    const { diagnosisId } = req.params;
    const user = req.user;

    if (!diagnosisId) {
      return res.status(400).json({ message: "diagnosisId is required." });
    }

    const symptom = await Diagnosis.findById(diagnosisId);

    if (!symptom) {
      return res
        .status(200)
        .json({ message: "Diagnosis not found.", details: [] });
    }

    let filter = {
      diagnosisId,
      $or: [{ isAdmin: true }, { doctorId: user.id }],
    };

    // Get all matching symptom properties documents
    const symptomPropertiesList = await DiagnosisProperties.find(filter)
      .sort({ createdAt: -1 })
      .populate("diagnosisId", "name")
      .populate("doctorId", "name");

    if (symptomPropertiesList.length === 0) {
      return res.status(200).json({
        message: "No properties found for this diagnosis.",
        details: [],
      });
    }

    // Combine all 'details' arrays from the documents
    const combinedCategoriesMap = new Map();

    symptomPropertiesList.forEach((symptomProp) => {
      symptomProp.details.forEach((category) => {
        if (!combinedCategoriesMap.has(category.categoryName)) {
          combinedCategoriesMap.set(category.categoryName, {
            categoryName: category.categoryName,
            _id: category._id,
            categoryProperties: [...category.categoryProperties],
          });
        } else {
          // Merge categoryProperties to avoid duplicates
          const existingCategory = combinedCategoriesMap.get(
            category.categoryName,
            category._id
          );

          category.categoryProperties.forEach((prop) => {
            const exists = existingCategory.categoryProperties.some(
              (p) => p.propertyName === prop.propertyName
            );
            if (!exists) {
              existingCategory.categoryProperties.push(prop);
            }
          });
        }
      });
    });

    const combinedCategories = Array.from(combinedCategoriesMap.values());

    return res.status(200).json({
      message: "Combined diagnosis properties fetched successfully.",
      details: combinedCategories,
    });
  } catch (error) {
    console.error("Error fetching DiagnosisProperties:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const searchDiagnosis = async (req, res) => {
  try {
    const { query } = req.query; // search query from request
    if (!query) {
      return res.status(400).json({ message: "Search query is required." });
    }
    // Use regex to perform case-insensitive search
    const symptoms = await Diagnosis.find({
      name: { $regex: query, $options: "i" }, // case-insensitive search
    }).sort({ createdAt: -1 });
    if (symptoms.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(symptoms);
  } catch (error) {
    console.error("Error searching diagnosis:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteDiagnosis = async (req, res) => {
  try {
    const { diagnosisId } = req.params; // Get symptomId from request params

    if (!diagnosisId || !mongoose.Types.ObjectId.isValid(diagnosisId)) {
      return res
        .status(400)
        .json({ message: "Valid diagnosisId is required." });
    }

    // Check if the symptom exists
    const symptom = await Diagnosis.findById(diagnosisId);
    if (!symptom) {
      return res.status(404).json({ message: "Diagnosis not found." });
    }

    // Delete the symptom
    await Diagnosis.findByIdAndDelete(diagnosisId);

    // Also delete associated properties if any
    await DiagnosisProperties.deleteMany({ diagnosisId: diagnosisId });

    res.status(200).json({ message: "Diagnosis deleted successfully." });
  } catch (error) {
    console.log("Error deleting diagnosis:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// investigations

export const createInvestigationByAdmin = async (req, res) => {
  try {
    const { name } = req.body;
    const admin = req.user;
    if (!name) {
      return res
        .status(400)
        .json({ message: "Investigation name is required" });
    }
    const newInvestigation = await Investigation.create({
      name,
      doctorId: null,
      isAdmin: admin.role === "admin" ? true : false,
    });
    res.status(201).json(newInvestigation);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createInvestigationByDoctor = async (req, res) => {
  try {
    const { name } = req.body;
    const doctorId = req.user.id;
    if (!name) {
      return res
        .status(400)
        .json({ message: "Investigation name is required" });
    }
    const newInvestigation = await Investigation.create({
      name,
      doctorId,
      isAdmin: false,
    });
    res.status(201).json({
      success: true,
      newInvestigation,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPaginatedInvestigations = async (req, res) => {
  try {
    // Destructure from authenticated user
    const { id, role } = req.user;

    let filter = {
      $or: [{ isAdmin: true }, { doctorId: id }],
    };

    // Fetch all investigations sorted by _id (or customize the sort logic)
    const allInvestigations = await Investigation.find(filter)
      .sort({ _id: 1 })
      .lean();

    res.status(200).json({ investigations: allInvestigations });
  } catch (err) {
    console.error("Error fetching investigations:", err);
    res.status(500).json({ message: "Failed to fetch investigations" });
  }
};

export const getInvestigationsByIds = async (req, res) => {
  try {
    const { ids } = req.body;
    const investigations = await Investigation.find({
      _id: { $in: ids },
    }).lean();

    res.status(200).json({ investigations });
  } catch (err) {
    console.error("Error fetching investigations by IDs:", err);
    res.status(500).json({ message: "Failed to fetch investigations" });
  }
};

export const searchInvestigations = async (req, res) => {
  try {
    const { query } = req.query; // search query from request
    if (!query) {
      return res.status(400).json({ message: "Search query is required." });
    }
    // Use regex to perform case-insensitive search
    const investigations = await Investigation.find({
      name: { $regex: query, $options: "i" }, // case-insensitive search
    }).sort({ createdAt: -1 });
    if (investigations.length === 0) {
      return res.status(200).json({ investigations: [] });
    }
    res.status(200).json({ investigations });
  } catch (error) {
    console.error("Error searching investigations:", error);
    res.status(500).json({ message: error.message });
  }
};

export const createInvestigationPanel = async (req, res) => {
  try {
    const { panelName, ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "IDs array is required." });
    }

    // Check if all IDs are valid ObjectIds
    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));

    if (invalidIds.length > 0) {
      return res.status(400).json({
        message: "Invalid IDs found in the request.",
        invalidIds,
      });
    }

    // Check if all investigations exist
    const investigations = await Investigation.find({
      _id: { $in: ids },
    });

    if (investigations.length !== ids.length) {
      return res.status(404).json({
        message: "Some investigations not found.",
        missingIds: ids.filter(
          (id) => !investigations.some((inv) => inv._id.toString() === id)
        ),
      });
    }

    // Create a new InvestigationPanel
    const newPanel = new InvestigationPanel({
      panelName: panelName || "New Panel",
      investigationIds: ids,
    });

    const savedPanel = await newPanel.save();
    res.status(201).json({
      success: true,
      message: "Investigation panel created successfully.",
      data: savedPanel,
    });
  } catch (error) {
    console.log("Error creating investigation panel:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getInvestigationPanels = async (req, res) => {
  try {
    const panels = await InvestigationPanel.find()
      .populate("investigationIds", "name")
      .sort({ createdAt: -1 });

    if (panels.length === 0) {
      return res
        .status(200)
        .json({ message: "No investigation panels found." });
    }

    res.status(200).json({
      success: true,
      message: "Investigation panels fetched successfully.",
      data: panels,
    });
  } catch (error) {
    console.error("Error fetching investigation panels:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteInvestigationPanel = async (req, res) => {
  try {
    const { panelId } = req.params;

    if (!panelId || !mongoose.Types.ObjectId.isValid(panelId)) {
      return res.status(400).json({ message: "Valid panelId is required." });
    }

    // Check if the panel exists
    const panel = await InvestigationPanel.findById(panelId);
    if (!panel) {
      return res
        .status(404)
        .json({ message: "Investigation panel not found." });
    }

    // Delete the panel
    await InvestigationPanel.findByIdAndDelete(panelId);

    res.status(200).json({
      success: true,
      message: "Investigation panel deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting investigation panel:", error);
    res.status(500).json({ message: error.message });
  }
};

// instructions

export const createInstructionsByAdmin = async (req, res) => {
  try {
    const { name } = req.body;
    const admin = req.user;
    if (!name) {
      return res.status(400).json({ message: "Instruction name is required" });
    }
    const newInvestigation = await Instructions.create({
      name,
      doctorId: null,
      isAdmin: admin.role === "admin" ? true : false,
    });
    res.status(201).json(newInvestigation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createInstructionsByDoctor = async (req, res) => {
  try {
    const { name } = req.body;
    const doctorId = req.user.id;
    if (!name) {
      return res.status(400).json({ message: "Instruction name is required" });
    }
    const newInvestigation = await Instructions.create({
      name,
      doctorId,
      isAdmin: false,
    });
    res.status(201).json({
      success: true,
      newInvestigation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaginatedInstructions = async (req, res) => {
  try {
    // Destructure from authenticated user
    const { id, role } = req.user;

    let filter = {
      $or: [{ isAdmin: true }, { doctorId: id }],
    };

    // Fetch all investigations sorted by _id (or customize the sort logic)
    const allInvestigations = await Instructions.find(filter)
      .sort({ _id: 1 })
      .lean();

    // Calculate total items to return: first 6 + 1 for each selected checkbox

    res.status(200).json({ instructions: allInvestigations });
  } catch (err) {
    console.error("Error fetching instructions:", err);
    res.status(500).json({ message: "Failed to fetch instructions" });
  }
};

export const searchInstructions = async (req, res) => {
  try {
    const { query } = req.query; // search query from request
    if (!query) {
      return res.status(400).json({ message: "Search query is required." });
    }
    // Use regex to perform case-insensitive search
    const instructions = await Instructions.find({
      name: { $regex: query, $options: "i" }, // case-insensitive search
    }).sort({ createdAt: -1 });
    if (instructions.length === 0) {
      return res.status(200).json({ instructions: [] });
    }
    res.status(200).json({ instructions });
  } catch (error) {
    console.error("Error searching instructions:", error);
    res.status(500).json({ message: error.message });
  }
};

// procedures

export const createProcedureByAdmin = async (req, res) => {
  try {
    const { name } = req.body;
    const admin = req.user;
    if (!name) {
      return res.status(400).json({ message: "Procedure name is required" });
    }
    const newInvestigation = await Procedures.create({
      name,
      doctorId: null,
      isAdmin: admin.role === "admin" ? true : false,
    });
    res.status(201).json(newInvestigation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProcedureByDoctor = async (req, res) => {
  try {
    const { name } = req.body;
    const doctorId = req.user.id;
    if (!name) {
      return res.status(400).json({ message: "Procedure name is required" });
    }
    const newInvestigation = await Procedures.create({
      name,
      doctorId,
      isAdmin: false,
    });
    res.status(201).json({
      success: true,
      newInvestigation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaginatedProcedures = async (req, res) => {
  try {
    // Destructure from authenticated user
    const { id, role } = req.user;

    let filter = {
      $or: [{ isAdmin: true }, { doctorId: id }],
    };

    // Fetch all investigations sorted by _id (or customize the sort logic)
    const allInvestigations = await Procedures.find(filter)
      .sort({ _id: 1 })
      .lean();

    res.status(200).json({ procedures: allInvestigations });
  } catch (err) {
    console.error("Error fetching procedures:", err);
    res.status(500).json({ message: "Failed to fetch procedures" });
  }
};

export const searchProcedures = async (req, res) => {
  try {
    const { query } = req.query; // search query from request
    if (!query) {
      return res.status(400).json({ message: "Search query is required." });
    }
    // Use regex to perform case-insensitive search
    const procedures = await Procedures.find({
      name: { $regex: query, $options: "i" }, // case-insensitive search
    }).sort({ createdAt: -1 });
    if (procedures.length === 0) {
      return res.status(200).json({ procedures: [] });
    }
    res.status(200).json({ procedures });
  } catch (error) {
    console.error("Error searching procedures:", error);
    res.status(500).json({ message: error.message });
  }
};

// medicines

export const createMedicineByAdmin = async (req, res) => {
  try {
    const { name, categoryId, categoryName, compositionID, compositionName } =
      req.body;

    const admin = req.user;

    if (
      !name ||
      (!categoryId && !categoryName) ||
      (!compositionID && !compositionName)
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    let category;
    if (categoryId) {
      category = await MedicineCategory.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found by ID." });
      }
    } else {
      category = await MedicineCategory.findOne({ name: categoryName.trim() });
      if (!category) {
        category = await MedicineCategory.create({
          name: categoryName.trim(),
          doctorId: null,
          isAdmin: true,
        });
      }
    }

    let composition;
    if (compositionID) {
      composition = await Composition.findById(compositionID);
      if (!composition) {
        return res
          .status(404)
          .json({ message: "Composition not found by ID." });
      }
    } else {
      composition = await Composition.findOne({
        compositionName: compositionName.trim(),
      });
      if (!composition) {
        composition = await Composition.create({
          compositionName: compositionName.trim(),
          doctorId: null,
          isAdmin: true,
        });
      }
    }

    const newMedicine = await Medicine.create({
      name,
      categoryId: category._id,
      categoryName: category.name,
      compositionId: composition._id,
      compositionName: composition.compositionName,
      doctorId: null,
      isAdmin: admin.role === "admin" ? true : false,
    });

    res.status(201).json(newMedicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMedicineByDoctor = async (req, res) => {
  try {
    const { name, categoryId, categoryName, compositionID, compositionName } =
      req.body;

    console.log("Creating medicine by doctor:", req.body);

    const doctorId = req.user.id;

    if (
      !name ||
      (!categoryId && !categoryName) ||
      (!compositionID && !compositionName)
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    let category;
    if (categoryId) {
      category = await MedicineCategory.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found by ID." });
      }
    } else {
      category = await MedicineCategory.findOne({
        name: categoryName.trim(),
        doctorId,
      });
      if (!category) {
        category = await MedicineCategory.create({
          name: categoryName.trim(),
          doctorId,
          isAdmin: false,
        });
      }
    }

    let composition;
    if (compositionID) {
      composition = await Composition.findById(compositionID);
      if (!composition) {
        return res
          .status(404)
          .json({ message: "Composition not found by ID." });
      }
    } else {
      composition = await Composition.findOne({
        compositionName: compositionName.trim(),
        doctorId,
      });
      if (!composition) {
        composition = await Composition.create({
          compositionName: compositionName.trim(),
          doctorId,
          isAdmin: false,
        });
      }
    }

    const newMedicine = await Medicine.create({
      name,
      categoryId: category._id,
      categoryName: category.name,
      compositionId: composition._id,
      compositionName: composition.compositionName,
      doctorId,
      isAdmin: false,
    });

    res.status(201).json({
      success: true,
      newMedicine,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMedicineByDoctor = async (req, res) => {
  try {
    const medicineId = req.params.id; // Get medicineId from request params
    const { name, categoryId, categoryName, compositionID, compositionName } =
      req.body;

    const doctorId = req.user.id;

    if (!medicineId || !mongoose.Types.ObjectId.isValid(medicineId)) {
      return res.status(400).json({ message: "Valid medicineId is required." });
    }

    if (
      !name ||
      (!categoryId && !categoryName) ||
      (!compositionID && !compositionName)
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    let category;
    if (categoryId) {
      category = await MedicineCategory.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found by ID." });
      }
    } else {
      category = await MedicineCategory.findOne({
        name: categoryName.trim(),
        doctorId,
      });
      if (!category) {
        category = await MedicineCategory.create({
          name: categoryName.trim(),
          doctorId,
          isAdmin: false,
        });
      }
    }

    let composition;
    if (compositionID) {
      composition = await Composition.findById(compositionID);
      if (!composition) {
        return res
          .status(404)
          .json({ message: "Composition not found by ID." });
      }
    } else {
      composition = await Composition.findOne({
        compositionName: compositionName.trim(),
        doctorId,
      });
      if (!composition) {
        composition = await Composition.create({
          compositionName: compositionName.trim(),
          doctorId,
          isAdmin: false,
        });
      }
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      medicineId,
      {
        name,
        categoryId: category._id,
        categoryName: category.name,
        compositionId: composition._id,
        compositionName: composition.compositionName,
        doctorId,
        isAdmin: false,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      updatedMedicine,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    const medicineId = req.params.id; // Get medicineId from request params

    if (!medicineId || !mongoose.Types.ObjectId.isValid(medicineId)) {
      return res.status(400).json({ message: "Valid medicineId is required." });
    }

    // Check if the medicine exists
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found." });
    }

    await Medicine.findByIdAndDelete(medicineId);
    res.status(200).json({ message: "Medicine deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaginatedMedicines = async (req, res) => {
  try {
    // Authenticated user
    const { id } = req.user;

    console.log(req.query.selectedCount, "fdfd");

    const selectedCount = parseInt(req.query.selectedCount || "0");

    const filter = {
      $or: [{ isAdmin: true }, { doctorId: id }],
    };

    if (selectedCount >= 0) {
      const allMedicines = await Medicine.find(filter).sort({ _id: 1 }).lean();

      const limit = 4 + selectedCount;
      const visibleMedicines = allMedicines.slice(0, limit);

      res.status(200).json({ medicines: visibleMedicines });
    } else {
      const allMedicines = await Medicine.find(filter).sort({ _id: 1 }).lean();

      res.status(200).json({ medicines: allMedicines });
    }
  } catch (err) {
    console.error("Error fetching medicines:", err);
    res.status(500).json({ message: "Failed to fetch medicines" });
  }
};

export const searchMedicines = async (req, res) => {
  try {
    const { query } = req.query; // search query from request
    if (!query) {
      return res.status(400).json({ message: "Search query is required." });
    }
    // Use regex to perform case-insensitive search
    const medicines = await Medicine.find({
      name: { $regex: query, $options: "i" }, // case-insensitive search
    }).sort({ createdAt: -1 });
    if (medicines.length === 0) {
      return res.status(200).json({ medicines: [] });
    }
    res.status(200).json({ medicines });
  } catch (error) {
    console.error("Error searching medicines:", error);
    res.status(500).json({ message: error.message });
  }
};

export const allMedicineCategories = async (req, res) => {
  try {
    const result = await MedicineCategory.find()
      .sort({ createdAt: -1 })
      .populate("doctorId", "name");

    if (result.length === 0) {
      return res.status(200).json({ categories: [] });
    }

    res.status(200).json({ categories: result });
  } catch (error) {
    console.error("Error searching medicine categories:", error);
    res.status(500).json({ message: error.message });
  }
};

export const allMedicineCompositions = async (req, res) => {
  try {
    const result = await Composition.find()
      .sort({ createdAt: -1 })
      .populate("doctorId", "name");

    if (result.length === 0) {
      return res.status(200).json({ compositions: [] });
    }

    res.status(200).json({ compositions: result });
  } catch (error) {
    console.error("Error searching compositions:", error);
    res.status(500).json({ message: error.message });
  }
};

// create or save records for template list

export const addOrSaveConsultSymptomsData = async (req, res) => {
  try {
    const {
      appointmentId,
      templateId,
      symptomId, // Note: This should match 'sympotmId' from schema
      note,
      since,
      severity,
      location,
      description,
      details = [],
    } = req.body;

    // Validate appointmentId
    if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res
        .status(400)
        .json({ message: "Valid appointmentId is required." });
    }

    // Validate symptomId (note the field name difference)
    if (!symptomId || !mongoose.Types.ObjectId.isValid(symptomId)) {
      return res.status(400).json({ message: "Valid symptomId is required." });
    }

    // Validate details structure if provided
    if (details && Array.isArray(details)) {
      for (const detail of details) {
        if (
          !detail.detailId ||
          !mongoose.Types.ObjectId.isValid(detail.detailId)
        ) {
          return res
            .status(400)
            .json({ message: "Each detail must have a valid detailId" });
        }
        if (detail.properties && Array.isArray(detail.properties)) {
          for (const property of detail.properties) {
            if (
              !property.propertyId ||
              !mongoose.Types.ObjectId.isValid(property.propertyId)
            ) {
              return res.status(400).json({
                message: "Each property must have a valid propertyId",
              });
            }
          }
        }
      }
    }

    // Check for existing record
    const existingRecord = await PatientSymptoms.findOne({
      appointmentId: appointmentId,
      symptomId: symptomId, // Note the schema field name
      templateId: templateId || null, // Allow null templateId
    });

    if (existingRecord) {
      existingRecord.templateId = templateId || existingRecord.templateId;
      existingRecord.note = note || existingRecord.note;
      existingRecord.since = since || existingRecord.since;
      existingRecord.severity = severity || existingRecord.severity;
      existingRecord.location = location || existingRecord.location;
      existingRecord.description = description || existingRecord.description;

      if (details && details.length) {
        for (const newDetail of details) {
          const existingDetail = existingRecord.details.find(
            (d) => d.detailId.toString() === newDetail.detailId.toString()
          );

          if (!existingDetail) {
            // If detailId is new, add it
            existingRecord.details.push(newDetail);
          } else {
            // Check properties inside that detail
            for (const newProp of newDetail.properties) {
              const existingProp = existingDetail.properties.find(
                (p) => p.propertyId.toString() === newProp.propertyId.toString()
              );
              if (!existingProp) {
                existingDetail.properties.push(newProp);
              } else {
                existingProp.propertyValue = newProp.propertyValue;
              }
            }
          }
        }
      }

      const updatedConsultData = await existingRecord.save();
      return res.status(200).json({
        message: "Consultation data updated successfully",
        data: updatedConsultData,
      });
    } else {
      // Create new record

      // Create new record
      const record = {
        appointmentId,
        templateId: templateId || null,
        symptomId,
        note: note || null,
        since: since || null,
        severity: severity || null,
        location: location || null,
        description: description || null,
        details,
      };

      const newConsultData = new PatientSymptoms(record);

      const savedConsultData = await newConsultData.save();
      return res.status(201).json({
        message: "Consultation data added successfully",
        data: savedConsultData,
      });
    }
  } catch (error) {
    console.error("Error in addOrSaveConsultData:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// export const saveDataToTemplate = async (req, res) => {
//   try {
//     const { appointmentId, patientName, templateId, type } = req.body;

//     console.log("Request body for saveDataToTemplate:", req.body);

//     const createdDate = new Date();
//     const formattedDate = createdDate.toLocaleDateString("en-US", {
//       day: "2-digit",
//       month: "long",
//       year: "numeric",
//     });

//     let existTemplateId = null;

//     if (templateId) {
//       // If templateId is provided, check if it exists
//       const existingTemplate = await TemplateList.findById(templateId);

//       if (existingTemplate) {
//         existTemplateId = existingTemplate._id;
//         console.log("existTemplateId:", existTemplateId);

//         let updateResult;

//         // Update all entries with the existing template ID
//         if (type === "medicine") {
//           updateResult = await PrescriptionItem.updateMany(
//             { appointmentId: appointmentId, templateId: null },
//             { $set: { templateId: existTemplateId } }
//           );
//         } else if (type === "symptom") {
//           updateResult = await PatientSymptoms.updateMany(
//             { appointmentId: appointmentId, templateId: null },
//             { $set: { templateId: existTemplateId } }
//           );
//         } else if (type === "investigation") {
//           updateResult = await PatientInvestigation.updateMany(
//             { appointmentId: appointmentId, templateId: null },
//             { $set: { templateId: existTemplateId } }
//           );
//         }

//         return res.status(200).json({
//           success: true,
//           message: "Existing template found and entries updated",
//           templateId: existTemplateId,
//           updateCount: updateResult.modifiedCount,
//         });
//       }
//     }

//     // Create a new template if templateId is not provided or not found
//     const newTemplate = new TemplateList({
//       name: patientName || "Untitled Template",
//       date: formattedDate,
//     });

//     await newTemplate.save();
//     existTemplateId = newTemplate._id;

//     let updateResult;

//     if (type === "medicine") {
//       // Update templateId in PatientSymptoms - specifically target null templateIds
//       updateResult = await PrescriptionItem.updateMany(
//         { appointmentId: appointmentId, templateId: null },
//         { $set: { templateId: existTemplateId } }
//       );
//     } else if (type === "symptom") {
//       updateResult = await PatientSymptoms.updateMany(
//         { appointmentId: appointmentId, templateId: null },
//         { $set: { templateId: existTemplateId } }
//       );
//     } else if (type === "investigation") {
//       updateResult = await PatientInvestigation.updateMany(
//         { appointmentId: appointmentId, templateId: null },
//         { $set: { templateId: existTemplateId } }
//       );
//     }

//     res.status(201).json({
//       message: "Data saved to new template successfully",
//       templateId: existTemplateId,
//       updateCount: updateResult.modifiedCount,
//     });
//   } catch (error) {
//     console.error("Error saving data to template:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const saveDataToTemplate = async (req, res) => {
  try {
    const {
      appointmentId,
      patientName,
      templateId,
      // Instead of a single 'type', accept arrays of data for each type
      symptomData = [], // For symptoms, findings, diagnosis
      medicineData = [], // For medicines
      investigationData = [], // For investigations, instructions, procedures
    } = req.body;

    console.log("Request body for saveDataToTemplate:", req.body);

    const createdDate = new Date();
    const formattedDate = createdDate.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    let existTemplateId = null;

    // If templateId is provided, check if it exists
    if (templateId) {
      const existingTemplate = await TemplateList.findById(templateId);

      if (existingTemplate) {
        existTemplateId = existingTemplate._id;
        console.log("existTemplateId:", existTemplateId);

        // Update all entries with the existing template ID
        const updatePromises = [];

        // Update symptoms, findings, diagnosis if data is provided
        if (symptomData.length > 0) {
          updatePromises.push(
            PatientSymptoms.updateMany(
              { appointmentId: appointmentId, templateId: null },
              { $set: { templateId: existTemplateId } }
            )
          );
        }

        // Update medicines if data is provided
        if (medicineData.length > 0) {
          updatePromises.push(
            PrescriptionItem.updateMany(
              { appointmentId: appointmentId, templateId: null },
              { $set: { templateId: existTemplateId } }
            )
          );
        }

        // Update investigations, instructions, procedures if data is provided
        if (investigationData.length > 0) {
          updatePromises.push(
            PatientInvestigation.updateMany(
              { appointmentId: appointmentId, templateId: null },
              { $set: { templateId: existTemplateId } }
            )
          );
        }

        // Wait for all updates to complete
        const updateResults = await Promise.all(updatePromises);

        return res.status(200).json({
          success: true,
          message: "Existing template found and entries updated",
          templateId: existTemplateId,
          updateResults,
        });
      }
    }

    // Create a new template if templateId is not provided or not found
    const newTemplate = new TemplateList({
      name: patientName || "Untitled Template",
      date: formattedDate,
    });

    await newTemplate.save();
    existTemplateId = newTemplate._id;

    // Update all relevant collections with the new template ID
    const updatePromises = [];

    // Update symptoms, findings, diagnosis if data is provided
    if (symptomData.length > 0) {
      updatePromises.push(
        PatientSymptoms.updateMany(
          { appointmentId: appointmentId, templateId: null },
          { $set: { templateId: existTemplateId } }
        )
      );
    }

    // Update medicines if data is provided
    if (medicineData.length > 0) {
      updatePromises.push(
        PrescriptionItem.updateMany(
          { appointmentId: appointmentId, templateId: null },
          { $set: { templateId: existTemplateId } }
        )
      );
    }

    // Update investigations, instructions, procedures if data is provided
    if (investigationData.length > 0) {
      updatePromises.push(
        PatientInvestigation.updateMany(
          { appointmentId: appointmentId, templateId: null },
          { $set: { templateId: existTemplateId } }
        )
      );
    }

    // Wait for all updates to complete
    const updateResults = await Promise.all(updatePromises);

    res.status(201).json({
      message: "Data saved to new template successfully",
      templateId: existTemplateId,
      updateResults,
    });
  } catch (error) {
    console.error("Error saving data to template:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllSavedTemplates = async (req, res) => {
  try {
    const templates = await TemplateList.find().sort({ createdAt: -1 });

    if (templates.length === 0) {
      return res.status(200).json({ templates: [] });
    }

    res.status(200).json({
      success: true,
      message: "Templates fetched successfully.",
      data: templates,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ message: error.message });
  }
};

// export const getDataByTemplateId = async (req, res) => {
//   try {
//     const { templateId } = req.params;

//     if (!templateId) {
//       return res.status(400).json({
//         success: false,
//         message: "Template ID is required",
//       });
//     }

//     // Find all patient items that use this templateId
//     const patientItems = await PatientSymptoms.find({
//       templateId: { $eq: templateId },
//     });

//     // Find all medicine items that use this templateId
//     const medicineItems = await PrescriptionItem.find({
//       templateId: { $eq: templateId },
//     });

//     if (
//       (!patientItems || patientItems.length === 0) &&
//       (!medicineItems || medicineItems.length === 0)
//     ) {
//       return res.status(404).json({
//         success: false,
//         message: "No data found for this template",
//       });
//     }

//     // Collect all symptom IDs to fetch their details
//     const symptomIds = patientItems.map((item) => item.symptomId);

//     // Collect all medicine IDs to fetch their details
//     const medicineIds = medicineItems.map((item) => item.medicineId);

//     // Fetch all symptoms, findings, diagnosis and medicine data in one go
//     const allSymptoms = await Symptoms.find({ _id: { $in: symptomIds } });
//     const allFindings = await Findings.find({ _id: { $in: symptomIds } });
//     const allDiagnosis = await Diagnosis.find({ _id: { $in: symptomIds } });
//     const allMedicines = await Medicine.find({ _id: { $in: medicineIds } });

//     // Create lookup maps for quick access
//     const symptomsMap = {};
//     allSymptoms.forEach((symptom) => {
//       symptomsMap[symptom._id.toString()] = {
//         ...symptom.toObject(),
//         type: "symptom",
//       };
//     });

//     const findingsMap = {};
//     allFindings.forEach((finding) => {
//       findingsMap[finding._id.toString()] = {
//         ...finding.toObject(),
//         type: "finding",
//       };
//     });

//     const diagnosisMap = {};
//     allDiagnosis.forEach((diagnosis) => {
//       diagnosisMap[diagnosis._id.toString()] = {
//         ...diagnosis.toObject(),
//         type: "diagnosis",
//       };
//     });

//     const medicinesMap = {};
//     allMedicines.forEach((medicine) => {
//       medicinesMap[medicine._id.toString()] = {
//         ...medicine.toObject(),
//       };
//     });

//     // Create a result object to store the formatted data
//     const result = {
//       appointmentId:
//         patientItems.length > 0
//           ? patientItems[0].appointmentId
//           : medicineItems.length > 0
//           ? medicineItems[0].appointmentId
//           : null,
//       templateId,
//       symptoms: [],
//       medicines: [],
//     };

//     // Process each patient item (symptoms, findings, diagnosis)
//     for (const item of patientItems) {
//       const symptomId = item.symptomId.toString();

//       // Determine if this is a symptom, finding, or diagnosis
//       let itemType = "unknown";
//       let itemData = null;

//       if (symptomsMap[symptomId]) {
//         itemType = "symptom";
//         itemData = symptomsMap[symptomId];
//       } else if (findingsMap[symptomId]) {
//         itemType = "finding";
//         itemData = findingsMap[symptomId];
//       } else if (diagnosisMap[symptomId]) {
//         itemType = "diagnosis";
//         itemData = diagnosisMap[symptomId];
//       }

//       // If we couldn't determine the type, log and skip
//       if (itemType === "unknown") {
//         console.log(`Could not find data for item with ID: ${symptomId}`);
//         continue;
//       }

//       // Create the basic item object
//       const itemObj = {
//         symptomId: item.symptomId,
//         name: itemData.name, // Include name from the source collection
//         note: item.note || null,
//         details: [],
//         type: itemType,
//       };

//       // Add type-specific properties
//       if (itemType === "diagnosis") {
//         itemObj.location = item.location || null;
//         itemObj.description = item.description || null;
//       } else {
//         // For symptoms and findings
//         itemObj.since = item.since || null;
//         itemObj.severity = item.severity || null;
//       }

//       // Get properties based on the item type
//       let itemProperties = null;
//       if (itemType === "symptom") {
//         itemProperties = await SymptomsProperties.findOne({
//           symptopId: item.symptomId,
//         });
//       } else if (itemType === "finding") {
//         itemProperties = await FindingsProperties.findOne({
//           findingId: item.symptomId,
//         });
//       } else if (itemType === "diagnosis") {
//         itemProperties = await DiagnosisProperties.findOne({
//           diagnosisId: item.symptomId,
//         });
//       }

//       // Process details if properties were found and details exist
//       if (itemProperties && item.details && item.details.length > 0) {
//         for (const detail of item.details) {
//           // Find the matching detail category in item properties
//           const categoryDetail = itemProperties.details.find(
//             (d) => d._id.toString() === detail.detailId.toString()
//           );

//           if (!categoryDetail) continue;

//           // Create a detail object with category name
//           const detailObj = {
//             categoryId: detail.detailId,
//             categoryName: categoryDetail.categoryName || "",
//             properties: [],
//           };

//           // Process each property in the detail
//           if (detail.properties && detail.properties.length > 0) {
//             for (const prop of detail.properties) {
//               // Find the property in item properties to get its name
//               const templateProperty = categoryDetail.categoryProperties.find(
//                 (p) => p._id.toString() === prop.propertyId.toString()
//               );

//               if (!templateProperty) continue;

//               // Add the property with its name and value
//               detailObj.properties.push({
//                 propertyId: prop.propertyId,
//                 propertyName: templateProperty.propertyName,
//                 propertyValue: prop.propertyValue,
//               });
//             }
//           }

//           itemObj.details.push(detailObj);
//         }
//       }

//       result.symptoms.push(itemObj);
//     }

//     // Process each medicine item
//     for (const item of medicineItems) {
//       const medicineId = item.medicineId.toString();
//       const medicineData = medicinesMap[medicineId];

//       if (!medicineData) {
//         console.log(`Could not find data for medicine with ID: ${medicineId}`);
//         continue;
//       }

//       // Create the medicine object
//       const medicineObj = {
//         medicineId: item.medicineId,
//         name: medicineData.name || "Unknown Medicine",
//         compositionName: medicineData.compositionName || "",
//         doses: [],
//       };

//       // Process each dose for this medicine
//       if (item.doses && item.doses.length > 0) {
//         for (const dose of item.doses) {
//           const doseObj = {
//             doseNumber: dose.doseNumber,
//             quantity: dose.quantity,
//             dosage: dose.dosage,
//             timing: dose.timing,
//             duration: dose.duration,
//             note: dose.note || "",
//             prescriptionType: dose.prescriptionType || "",
//           };

//           medicineObj.doses.push(doseObj);
//         }
//       }

//       result.medicines.push(medicineObj);
//     }

//     return res.status(200).json({
//       success: true,
//       data: result,
//     });
//   } catch (error) {
//     console.error("Error fetching data by templateId:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const getDataByTemplateId = async (req, res) => {
  try {
    const { templateId } = req.params;

    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: "Template ID is required",
      });
    }

    // Find all patient items that use this templateId
    const patientItems = await PatientSymptoms.find({
      templateId: { $eq: templateId },
    });

    // Find all medicine items that use this templateId
    const medicineItems = await PrescriptionItem.find({
      templateId: { $eq: templateId },
    });

    // Find patient investigation document that contains investigations, instructions, and procedures
    const patientInvestigation = await PatientInvestigation.findOne({
      templateId: { $eq: templateId },
    });

    if (
      (!patientItems || patientItems.length === 0) &&
      (!medicineItems || medicineItems.length === 0) &&
      !patientInvestigation
    ) {
      return res.status(404).json({
        success: false,
        message: "No data found for this template",
      });
    }

    // Collect all symptom IDs to fetch their details
    const symptomIds = patientItems.map((item) => item.symptomId);

    // Collect all medicine IDs to fetch their details
    const medicineIds = medicineItems.map((item) => item.medicineId);

    // Collect investigation, instruction, and procedure IDs if they exist
    const investigationIds = patientInvestigation?.investigations || [];
    const instructionIds = patientInvestigation?.instructions || [];
    const procedureIds = patientInvestigation?.procedures || [];

    // Fetch all symptoms, findings, diagnosis and medicine data in one go
    const allSymptoms = await Symptoms.find({ _id: { $in: symptomIds } });
    const allFindings = await Findings.find({ _id: { $in: symptomIds } });
    const allDiagnosis = await Diagnosis.find({ _id: { $in: symptomIds } });
    const allMedicines = await Medicine.find({ _id: { $in: medicineIds } });

    // Fetch investigations, instructions, and procedures data if IDs exist
    const allInvestigations =
      investigationIds.length > 0
        ? await Investigation.find({ _id: { $in: investigationIds } })
        : [];
    const allInstructions =
      instructionIds.length > 0
        ? await Instructions.find({ _id: { $in: instructionIds } })
        : [];
    const allProcedures =
      procedureIds.length > 0
        ? await Procedures.find({ _id: { $in: procedureIds } })
        : [];

    // Create lookup maps for quick access
    const symptomsMap = {};
    allSymptoms.forEach((symptom) => {
      symptomsMap[symptom._id.toString()] = {
        ...symptom.toObject(),
        type: "symptom",
      };
    });

    const findingsMap = {};
    allFindings.forEach((finding) => {
      findingsMap[finding._id.toString()] = {
        ...finding.toObject(),
        type: "finding",
      };
    });

    const diagnosisMap = {};
    allDiagnosis.forEach((diagnosis) => {
      diagnosisMap[diagnosis._id.toString()] = {
        ...diagnosis.toObject(),
        type: "diagnosis",
      };
    });

    const medicinesMap = {};
    allMedicines.forEach((medicine) => {
      medicinesMap[medicine._id.toString()] = {
        ...medicine.toObject(),
      };
    });

    // Create lookup maps for investigations, instructions, and procedures
    const investigationsMap = {};
    allInvestigations.forEach((investigation) => {
      investigationsMap[investigation._id.toString()] =
        investigation.toObject();
    });

    const instructionsMap = {};
    allInstructions.forEach((instruction) => {
      instructionsMap[instruction._id.toString()] = instruction.toObject();
    });

    const proceduresMap = {};
    allProcedures.forEach((procedure) => {
      proceduresMap[procedure._id.toString()] = procedure.toObject();
    });

    // Create a result object to store the formatted data
    const result = {
      appointmentId:
        patientItems.length > 0
          ? patientItems[0].appointmentId
          : medicineItems.length > 0
          ? medicineItems[0].appointmentId
          : patientInvestigation
          ? patientInvestigation.appointmentId
          : null,
      templateId,
      symptoms: [],
      medicines: [],
      investigations: [],
      instructions: [],
      procedures: [],
    };

    // Process each patient item (symptoms, findings, diagnosis)
    for (const item of patientItems) {
      const symptomId = item.symptomId.toString();

      // Determine if this is a symptom, finding, or diagnosis
      let itemType = "unknown";
      let itemData = null;

      if (symptomsMap[symptomId]) {
        itemType = "symptom";
        itemData = symptomsMap[symptomId];
      } else if (findingsMap[symptomId]) {
        itemType = "finding";
        itemData = findingsMap[symptomId];
      } else if (diagnosisMap[symptomId]) {
        itemType = "diagnosis";
        itemData = diagnosisMap[symptomId];
      }

      // If we couldn't determine the type, log and skip
      if (itemType === "unknown") {
        console.log(`Could not find data for item with ID: ${symptomId}`);
        continue;
      }

      // Create the basic item object
      const itemObj = {
        symptomId: item.symptomId,
        name: itemData.name, // Include name from the source collection
        note: item.note || null,
        details: [],
        type: itemType,
      };

      // Add type-specific properties
      if (itemType === "diagnosis") {
        itemObj.location = item.location || null;
        itemObj.description = item.description || null;
      } else {
        // For symptoms and findings
        itemObj.since = item.since || null;
        itemObj.severity = item.severity || null;
      }

      // Get properties based on the item type
      let itemProperties = null;
      if (itemType === "symptom") {
        itemProperties = await SymptomsProperties.findOne({
          symptopId: item.symptomId,
        });
      } else if (itemType === "finding") {
        itemProperties = await FindingsProperties.findOne({
          findingsId: item.symptomId,
        });
      } else if (itemType === "diagnosis") {
        itemProperties = await DiagnosisProperties.findOne({
          diagnosisId: item.symptomId,
        });
      }

      // Process details if details exist in the item (even if properties weren't found)
      if (item.details && item.details.length > 0) {
        for (const detail of item.details) {
          // Create a detail object with category name (default to empty if not found)
          const detailObj = {
            categoryId: detail.detailId,
            categoryName: "", // Default value in case we can't find it
            properties: [],
          };

          // Try to find the matching detail category in item properties
          if (itemProperties && itemProperties.details) {
            const categoryDetail = itemProperties.details.find(
              (d) => d._id.toString() === detail.detailId.toString()
            );

            if (categoryDetail) {
              detailObj.categoryName = categoryDetail.categoryName || "";
            }
          }

          // Process each property in the detail
          if (detail.properties && detail.properties.length > 0) {
            for (const prop of detail.properties) {
              // Try to find property name if possible
              let propertyName = "";

              if (itemProperties && itemProperties.details) {
                const categoryDetail = itemProperties.details.find(
                  (d) => d._id.toString() === detail.detailId.toString()
                );

                if (categoryDetail && categoryDetail.categoryProperties) {
                  const templateProperty =
                    categoryDetail.categoryProperties.find(
                      (p) => p._id.toString() === prop.propertyId.toString()
                    );

                  if (templateProperty) {
                    propertyName = templateProperty.propertyName;
                  }
                }
              }

              // Add the property with its name and value
              detailObj.properties.push({
                propertyId: prop.propertyId,
                propertyName: propertyName || `Property ${prop.propertyId}`, // Fallback name
                propertyValue: prop.propertyValue,
              });
            }
          }

          // Add the detail to the item even if we couldn't find matching properties
          itemObj.details.push(detailObj);
        }
      }

      result.symptoms.push(itemObj);
    }

    // Rest of the function remains the same...
    // Process each medicine item
    for (const item of medicineItems) {
      const medicineId = item.medicineId.toString();
      const medicineData = medicinesMap[medicineId];

      if (!medicineData) {
        console.log(`Could not find data for medicine with ID: ${medicineId}`);
        continue;
      }

      // Create the medicine object
      const medicineObj = {
        medicineId: item.medicineId,
        name: medicineData.name || "Unknown Medicine",
        compositionName: medicineData.compositionName || "",
        doses: [],
      };

      // Process each dose for this medicine
      if (item.doses && item.doses.length > 0) {
        for (const dose of item.doses) {
          const doseObj = {
            doseNumber: dose.doseNumber,
            quantity: dose.quantity,
            dosage: dose.dosage,
            timing: dose.timing,
            duration: dose.duration,
            note: dose.note || "",
            prescriptionType: dose.prescriptionType || "",
          };

          medicineObj.doses.push(doseObj);
        }
      }

      result.medicines.push(medicineObj);
    }

    // Process investigations if they exist
    if (investigationIds.length > 0) {
      for (const investigationId of investigationIds) {
        const id = investigationId.toString();
        const investigation = investigationsMap[id];

        if (investigation) {
          result.investigations.push({
            investigationId,
            name: investigation.name || "Unknown Investigation",
            description: investigation.description || "",
            category: investigation.category || "",
            // Add any other relevant fields from the investigation document
          });
        }
      }
    }

    // Process instructions if they exist
    if (instructionIds.length > 0) {
      for (const instructionId of instructionIds) {
        const id = instructionId.toString();
        const instruction = instructionsMap[id];

        if (instruction) {
          result.instructions.push({
            instructionId,
            name: instruction.name || "Unknown Instruction",
            description: instruction.description || "",
            // Add any other relevant fields from the instruction document
          });
        }
      }
    }

    // Process procedures if they exist
    if (procedureIds.length > 0) {
      for (const procedureId of procedureIds) {
        const id = procedureId.toString();
        const procedure = proceduresMap[id];

        if (procedure) {
          result.procedures.push({
            procedureId,
            name: procedure.name || "Unknown Procedure",
            description: procedure.description || "",
            duration: procedure.duration || "",
            // Add any other relevant fields from the procedure document
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching data by templateId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPastPatientSymptomsFindingsDiagnosis = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: "Valid appointmentId is required.",
      });
    }

    // Fetch appointment to get patientId
    const appointment = await Appoinment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const patientId = appointment.patientId;

    // Fetch all appointments for the patient (including current)
    const pastAppointments = await Appoinment.find({
      patientId: patientId,
    }).sort({ createdAt: -1 });

    if (!pastAppointments || pastAppointments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No past appointments found for this patient.",
        data: {
          symptoms: [],
          findings: [],
          diagnosis: [],
        },
        pastDates: [],
      });
    }

    const pastAppointmentIds = pastAppointments.map((appt) => appt._id);
    const pastDates = pastAppointments.map((appt) => appt.appointmentDate);

    // Create a map of appointmentId to appointmentDate
    const appointmentIdToDate = {};
    pastAppointments.forEach((appt) => {
      appointmentIdToDate[appt._id.toString()] = appt.appointmentDate;
    });

    // Fetch patient items from PatientSymptoms model
    const patientItems = await PatientSymptoms.find({
      appointmentId: { $in: pastAppointmentIds },
    });

    const symptomIds = patientItems.map((item) => item.symptomId);

    // Fetch from master collections
    const [allSymptoms, allFindings, allDiagnosis] = await Promise.all([
      Symptoms.find({ _id: { $in: symptomIds } }),
      Findings.find({ _id: { $in: symptomIds } }),
      Diagnosis.find({ _id: { $in: symptomIds } }),
    ]);

    // Create lookup maps
    const symptomsMap = Object.fromEntries(
      allSymptoms.map((s) => [
        s._id.toString(),
        { ...s.toObject(), type: "symptom" },
      ])
    );
    const findingsMap = Object.fromEntries(
      allFindings.map((f) => [
        f._id.toString(),
        { ...f.toObject(), type: "finding" },
      ])
    );
    const diagnosisMap = Object.fromEntries(
      allDiagnosis.map((d) => [
        d._id.toString(),
        { ...d.toObject(), type: "diagnosis" },
      ])
    );

    const symptoms = [];
    const findings = [];
    const diagnosis = [];

    // Process each patient item
    for (const item of patientItems) {
      const symptomIdStr = item.symptomId.toString();
      const appointmentDate =
        appointmentIdToDate[item.appointmentId.toString()] || null;

      let category = null;
      if (symptomsMap[symptomIdStr]) {
        category = { ...symptomsMap[symptomIdStr], type: "symptom" };
      } else if (findingsMap[symptomIdStr]) {
        category = { ...findingsMap[symptomIdStr], type: "finding" };
      } else if (diagnosisMap[symptomIdStr]) {
        category = { ...diagnosisMap[symptomIdStr], type: "diagnosis" };
      }

      if (!category) {
        console.log(
          `Item with symptomId ${symptomIdStr} not found in any master collection`
        );
        continue;
      }

      const itemObj = {
        symptomId: item.symptomId,
        name: category.name,
        note: item.note || null,
        since: item.since || null,
        severity: item.severity || null,
        location: item.location || null,
        description: item.description || null,
        details: item.details || [],
        type: category.type,
        date: appointmentDate, // 👉 Date linked here
      };

      // Push to the correct array
      if (category.type === "symptom") {
        symptoms.push(itemObj);
      } else if (category.type === "finding") {
        findings.push(itemObj);
      } else if (category.type === "diagnosis") {
        diagnosis.push(itemObj);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Past patient clinical data fetched successfully.",
      data: {
        symptoms,
        findings,
        diagnosis,
      },
      pastDates,
    });
  } catch (error) {
    console.error("Error fetching past patient data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deletePatientSymptoms = async (req, res) => {
  try {
    const { symptomId } = req.params;

    if (!symptomId || !mongoose.Types.ObjectId.isValid(symptomId)) {
      return res.status(400).json({ message: "Valid symptomId is required." });
    }

    // Check if the symptoms exist for the given appointmentId
    const symptoms = await PatientSymptoms.find({ symptomId });

    if (symptoms.length === 0) {
      return res.status(404).json({ message: "No symptoms found." });
    }

    // Delete all symptoms for the given appointmentId
    await PatientSymptoms.deleteOne({ symptomId });

    res.status(200).json({
      success: true,
      message: "Patient symptoms deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting patient symptoms:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const upsertPrescriptionItem = async (req, res) => {
  try {
    const { appointmentId, medicineId, doses = [], templateId } = req.body;

    if (
      !appointmentId ||
      !medicineId ||
      !Array.isArray(doses) ||
      doses.length === 0
    ) {
      return res.status(400).json({ message: "Missing or invalid fields." });
    }

    // ✅ Prevent duplicate doseNumber in request
    const seen = new Set();
    for (const dose of doses) {
      if (seen.has(dose.doseNumber)) {
        return res.status(400).json({
          message: `Duplicate doseNumber found in request: ${dose.doseNumber}`,
        });
      }
      seen.add(dose.doseNumber);
    }

    // Find existing prescription
    const existingItem = await PrescriptionItem.findOne({
      appointmentId,
      medicineId,
      templateId: templateId || null,
    });

    if (existingItem) {
      existingItem.templateId = templateId || existingItem.templateId;

      for (const newDose of doses) {
        const index = existingItem.doses.findIndex(
          (d) => d.doseNumber === newDose.doseNumber
        );

        if (index !== -1) {
          // Update existing dose
          existingItem.doses[index] = {
            ...existingItem.doses[index],
            ...newDose,
          };
        } else {
          // Add new dose
          existingItem.doses.push(newDose);
        }
      }

      await existingItem.save();
      return res.status(200).json({
        message: "Prescription updated",
        data: existingItem,
      });
    } else {
      // Create new item with all doses
      const newItem = await PrescriptionItem.create({
        appointmentId,
        templateId: null,
        medicineId,
        doctorId: req.user.id,
        doses,
      });

      return res.status(201).json({
        message: "Prescription created",
        data: newItem,
      });
    }
  } catch (error) {
    console.error("Error in upsertPrescriptionItem:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const upsertPatientInvestigation = async (req, res) => {
  try {
    const {
      appointmentId,
      templateId,
      type, // must be: "investigations" | "instructions" | "procedures"
      items, // array of ObjectId strings
    } = req.body;

    if (!appointmentId || !type || !Array.isArray(items)) {
      return res.status(400).json({
        message: "appointmentId, type, and items array are required.",
      });
    }

    if (!["investigations", "instructions", "procedures"].includes(type)) {
      return res.status(400).json({ message: "Invalid type provided." });
    }

    let record = await PatientInvestigation.findOne({
      appointmentId,
      templateId,
    });

    // Case 1: Record exists
    if (record) {
      let updated = false;

      // Always update the array with the new items
      record[type] = items;
      updated = true;

      if (templateId && !record.templateId) {
        record.templateId = templateId;
        updated = true;
      }

      if (updated) {
        await record.save();
        return res.status(200).json({
          message: `Updated ${type} for existing PatientInvestigation.`,
          data: record,
        });
      } else {
        return res.status(200).json({
          message: `No update applied.`,
          data: record,
        });
      }
    }

    // Case 2: No record — create new
    const newRecord = await PatientInvestigation.create({
      appointmentId,
      templateId: templateId || null,
      investigations: type === "investigations" ? items : [],
      instructions: type === "instructions" ? items : [],
      procedures: type === "procedures" ? items : [],
    });

    return res.status(201).json({
      message: `New PatientInvestigation created with ${type}.`,
      data: newRecord,
    });
  } catch (error) {
    console.error("Error in upsertPatientInvestigation:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const addOrUpdateDosageCalculator = async (req, res) => {
  try {
    const {
      selectedQuantity,
      factor,
      strength,
      maxValue,
      multiplier,
      maxDosage,
      medicineId,
      appointmentId,
    } = req.body;

    const doctorId = req.user.id; // Assuming the user is a doctor and their ID is in req.user

    if (!selectedQuantity || !medicineId || !appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const query = {
      doctorId,
      medicineId,
      appointmentId,
    };

    const updateData = {
      selectedQuantity,
      factor,
      strength,
      maxValue,
      multiplier,
      maxDosage,
    };

    const options = {
      new: true,
      upsert: true, // Create if not exists
      setDefaultsOnInsert: true,
    };

    const dosage = await DosageCalculatorSchema.findOneAndUpdate(
      query,
      updateData,
      options
    );

    return res.status(200).json({
      success: true,
      message: "Dosage calculator data saved successfully",
      data: dosage,
    });
  } catch (error) {
    console.error("Error saving dosage calculator:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving dosage calculator",
    });
  }
};

export const getDosageCalculatorData = async (req, res) => {
  try {
    const { medicineId, appointmentId } = req.query;

    if (!medicineId || !appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const doctorId = req.user.id; // Assuming the user is a doctor and their ID is in req.user

    const dosage = await DosageCalculatorSchema.findOne({
      doctorId,
      medicineId,
      appointmentId,
    });

    if (!dosage) {
      return res.status(200).json({
        success: false,
        message: "Dosage calculator data not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: dosage,
    });
  } catch (error) {
    console.error("Error fetching dosage calculator data:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching dosage calculator data",
    });
  }
};

export const createReport = async (req, res) => {
  try {
    const { issue, item, itemId } = req.body;
    const doctorId = req.user.id; // Assuming the user is a doctor and their ID is in req.user

    if (!issue || !item || !itemId) {
      return res.status(400).json({
        message: "Issue, item, and itemId are required.",
      });
    }

    const report = new Report({
      issue,
      item,
      itemId,
      doctorId,
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: report,
    });
  } catch (error) {
    console.log("Error creating report:", error);
    res.status(500).json({ message: error.message });
  }
};

export const addOrUpdateMedicineData = async (req, res) => {
  try {
    const { appointmentId, medicineId, doses = [], isStarred } = req.body;

    if (
      !appointmentId ||
      !medicineId ||
      !Array.isArray(doses) ||
      doses.length === 0
    ) {
      return res.status(400).json({ message: "Missing or invalid fields." });
    }

    // ✅ Prevent duplicate doseNumber in request
    const seen = new Set();
    for (const dose of doses) {
      if (seen.has(dose.doseNumber)) {
        return res.status(400).json({
          message: `Duplicate doseNumber found in request: ${dose.doseNumber}`,
        });
      }
      seen.add(dose.doseNumber);
    }

    // Find existing prescription
    const existingItem = await PrescriptionItem.findOne({
      appointmentId,
      medicineId,
      doctorId: req.user.id,
    });

    if (existingItem) {
      existingItem.isStarred = existingItem.isStarred || isStarred;

      for (const newDose of doses) {
        const index = existingItem.doses.findIndex(
          (d) => d.doseNumber === newDose.doseNumber
        );

        if (index !== -1) {
          // Update existing dose
          existingItem.doses[index] = {
            ...existingItem.doses[index],
            ...newDose,
          };
        } else {
          // Add new dose
          existingItem.doses.push(newDose);
        }
      }

      await existingItem.save();
      return res.status(200).json({
        message: "Prescription updated",
        data: existingItem,
      });
    } else {
      // Create new item with all doses
      const newItem = await PrescriptionItem.create({
        appointmentId,
        templateId: null,
        medicineId,
        doses,
        doctorId: req.user.id,
        isStarred: isStarred || false,
      });

      return res.status(201).json({
        message: "Prescription created",
        data: newItem,
      });
    }
  } catch (error) {
    console.error("Error in upsertPrescriptionItem:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getMedicineData = async (req, res) => {
  try {
    const { medicineId } = req.params;
    if (!medicineId) {
      return res.status(400).json({
        message: "Medicine ID is required.",
      });
    }

    const doctorId = req.user.id;

    const medicineData = await PrescriptionItem.findOne({
      medicineId: medicineId,
      doctorId: doctorId,
      isStarred: true,
    });

    if (!medicineData) {
      return res.status(200).json({
        message: "Medicine data not found.",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: medicineData,
    });
  } catch (error) {
    console.log("Error fetching medicine data:", error);
    res.status(500).json({ message: error.message });
  }
};

export const removeMedicineData = async (req, res) => {
  try {
    const { medicineId } = req.params;
    if (!medicineId) {
      return res.status(400).json({
        message: "Medicine ID is required.",
      });
    }

    const doctorId = req.user.id;

    const result = await PrescriptionItem.updateOne(
      {
        medicineId: medicineId,
        doctorId: doctorId,
      },
      {
        $set: { isStarred: false }, // Mark as starred instead of deleting
      }
    );

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Medicine data not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Medicine data removed successfully.",
    });
  } catch (error) {
    console.log("Error removing medicine data:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getProcedureLocations = async (req, res) => {
  const { appointmentId } = req.params;
  console.log("Fetching procedure locations for appointmentId:", appointmentId);
  try {
    const procedureLocations = await ProcedureLocation.findOne({
      appointmentId,
    });
    if (!procedureLocations) {
      return res.status(200).json({ message: "Procedure locations not found" });
    }

    res.status(200).json({
      success: true,
      data: procedureLocations,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createOrUpdateProcedureLocation = async (req, res) => {
  const { name, email, mobile, address, appointmentId } = req.body;

  if (!name || !mobile || !address || !appointmentId) {
    return res.status(400).json({
      message: "Name, mobile, address, and appointmentId are required",
    });
  }

  try {
    // Check if a record already exists for this appointmentId
    const existingProcedureLocation = await ProcedureLocation.findOne({
      appointmentId,
    });

    if (existingProcedureLocation) {
      // Update existing record
      existingProcedureLocation.name = name;
      existingProcedureLocation.email = email;
      existingProcedureLocation.mobile = mobile;
      existingProcedureLocation.address = address;

      const updatedProcedureLocation = await existingProcedureLocation.save();

      return res.status(200).json({
        message: "Procedure location updated successfully",
        data: updatedProcedureLocation,
        isUpdate: true,
      });
    } else {
      // Create new record
      const newProcedureLocation = new ProcedureLocation({
        appointmentId,
        name,
        email,
        mobile,
        address,
      });

      const savedProcedureLocation = await newProcedureLocation.save();

      return res.status(201).json({
        message: "Procedure location created successfully",
        data: savedProcedureLocation,
        isUpdate: false,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPastPatientAppointments = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: "Valid appointmentId is required.",
      });
    }

    const appointment = await Appoinment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const patientId = appointment.patientId;

    const pastAppointments = await Appoinment.find({
      patientId,
    }).sort({ createdAt: -1 });

    const pastAppointmentIds = pastAppointments.map((appt) => appt._id);

    // Map appointmentId => date
    const appointmentIdToDate = {};
    // Map appointmentId => doctorId for doctor data lookup
    const appointmentIdToDoctorId = {};
    const pastDates = pastAppointments.map((appt) => {
      appointmentIdToDate[appt._id.toString()] = appt.appointmentDate;
      appointmentIdToDoctorId[appt._id.toString()] = appt.doctorId;
      return appt.appointmentDate;
    });

    if (pastAppointments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No past appointments found for this patient.",
        data: {},
        pastDates: [],
      });
    }

    // Get unique doctor IDs for fetching doctor data
    const uniqueDoctorIds = [
      ...new Set(pastAppointments.map((appt) => appt.doctorId).filter(Boolean)),
    ];

    // Fetch data in parallel (including doctor data)
    const [patientItems, prescriptionItems, patientInvestigations, doctorData] =
      await Promise.all([
        PatientSymptoms.find({ appointmentId: { $in: pastAppointmentIds } }),
        PrescriptionItem.find({ appointmentId: { $in: pastAppointmentIds } }),
        PatientInvestigation.find({
          appointmentId: { $in: pastAppointmentIds },
        }),
        Doctor.find({ _id: { $in: uniqueDoctorIds } }),
      ]);

    // Extract IDs
    const symptomIds = patientItems.map((item) => item.symptomId);
    const medicineIds = prescriptionItems.map((item) => item.medicineId);
    const investigationIds = patientInvestigations
      .flatMap((inv) => inv.investigations)
      .filter(Boolean);

    // Fetch master data
    const [
      allSymptoms,
      allFindings,
      allDiagnosis,
      allMedicines,
      allInvestigations,
    ] = await Promise.all([
      Symptoms.find({ _id: { $in: symptomIds } }),
      Findings.find({ _id: { $in: symptomIds } }),
      Diagnosis.find({ _id: { $in: symptomIds } }),
      Medicine.find({ _id: { $in: medicineIds } }),
      Investigation.find({ _id: { $in: investigationIds } }),
    ]);

    // Create lookup maps
    const symptomsMap = Object.fromEntries(
      allSymptoms.map((s) => [
        s._id.toString(),
        { ...s.toObject(), type: "symptom" },
      ])
    );
    const findingsMap = Object.fromEntries(
      allFindings.map((f) => [
        f._id.toString(),
        { ...f.toObject(), type: "finding" },
      ])
    );
    const diagnosisMap = Object.fromEntries(
      allDiagnosis.map((d) => [
        d._id.toString(),
        { ...d.toObject(), type: "diagnosis" },
      ])
    );
    const medicinesMap = Object.fromEntries(
      allMedicines.map((m) => [m._id.toString(), m.toObject()])
    );
    const investigationsMap = Object.fromEntries(
      allInvestigations.map((i) => [i._id.toString(), i.toObject()])
    );
    // Create doctor lookup map
    const doctorsMap = Object.fromEntries(
      doctorData.map((d) => [d._id.toString(), d.toObject()])
    );

    const datewiseData = {};

    const formatDate = (rawDate) => {
      // Add null check for rawDate
      if (!rawDate) return null;
      const d = new Date(rawDate);
      // Check if date is valid
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }); // Example: "2 July 2025"
    };

    const initDateBucket = (date, appointmentId) => {
      // Add null check for date
      if (!date) return;
      if (!datewiseData[date]) {
        // Get doctor data for this appointment
        const doctorId = appointmentIdToDoctorId[appointmentId];
        const doctorInfo = doctorId ? doctorsMap[doctorId.toString()] : null;

        datewiseData[date] = {
          symptoms: [],
          findings: [],
          diagnosis: [],
          medicines: [],
          investigations: [],
          doctor: doctorInfo
            ? {
                doctorId: doctorInfo._id,
                name:
                  `${doctorInfo.firstName} ${doctorInfo.lastName}` ||
                  "Unknown Doctor",
                specialization: doctorInfo.specialization || "",
                email: doctorInfo.email || "",
                phone: doctorInfo.phone || "",
                profileImage: doctorInfo.profileImage || null,
              }
            : null,
        };
      }
    };

    // Process symptoms/findings/diagnosis
    for (const item of patientItems) {
      // Add null checks
      if (!item || !item.appointmentId || !item.symptomId) continue;

      const appointmentIdStr = item.appointmentId.toString();
      const appointmentDateRaw = appointmentIdToDate[appointmentIdStr];
      const appointmentDate = formatDate(appointmentDateRaw);

      // Skip if date formatting failed
      if (!appointmentDate) continue;

      initDateBucket(appointmentDate, appointmentIdStr);

      const symptomIdStr = item.symptomId.toString();

      let category = null;
      if (symptomsMap[symptomIdStr]) {
        category = symptomsMap[symptomIdStr];
      } else if (findingsMap[symptomIdStr]) {
        category = findingsMap[symptomIdStr];
      } else if (diagnosisMap[symptomIdStr]) {
        category = diagnosisMap[symptomIdStr];
      }

      if (!category) continue;

      const type = category.type;
      const validTypes = ["symptom", "finding", "diagnosis"];
      if (!validTypes.includes(type)) continue;

      const itemObj = {
        symptomId: item.symptomId,
        name: category.name,
        note: item.note || null,
        since: item.since || null,
        severity: item.severity || null,
        location: item.location || null,
        description: item.description || null,
        details: item.details || [],
        type: type,
      };

      // Additional safety check before push
      if (
        datewiseData[appointmentDate] &&
        datewiseData[appointmentDate][type + "s"]
      ) {
        datewiseData[appointmentDate][type + "s"].push(itemObj);
      }
    }

    // Process prescriptions
    for (const item of prescriptionItems) {
      // Add null checks
      if (!item || !item.appointmentId || !item.medicineId) continue;

      const appointmentIdStr = item.appointmentId.toString();
      const appointmentDateRaw = appointmentIdToDate[appointmentIdStr];
      const appointmentDate = formatDate(appointmentDateRaw);

      // Skip if date formatting failed
      if (!appointmentDate) continue;

      initDateBucket(appointmentDate, appointmentIdStr);

      const medicineIdStr = item.medicineId.toString();
      const medicineData = medicinesMap[medicineIdStr];
      if (!medicineData) continue;

      const medicineObj = {
        medicineId: item.medicineId,
        name: medicineData.name || "Unknown Medicine",
        compositionName: medicineData.compositionName || "",
        doses: [],
      };

      if (item.doses?.length > 0) {
        for (const dose of item.doses) {
          medicineObj.doses.push({
            doseNumber: dose.doseNumber,
            quantity: dose.quantity,
            dosage: dose.dosage,
            timing: dose.timing,
            duration: dose.duration,
            note: dose.note || "",
            prescriptionType: dose.prescriptionType || "",
          });
        }
      }

      // Additional safety check before push
      if (
        datewiseData[appointmentDate] &&
        datewiseData[appointmentDate].medicines
      ) {
        datewiseData[appointmentDate].medicines.push(medicineObj);
      }
    }

    // Process investigations
    for (const inv of patientInvestigations) {
      // Add null checks
      if (!inv || !inv.appointmentId) continue;

      const appointmentIdStr = inv.appointmentId.toString();
      const appointmentDateRaw = appointmentIdToDate[appointmentIdStr];
      const appointmentDate = formatDate(appointmentDateRaw);

      // Skip if date formatting failed
      if (!appointmentDate) continue;

      initDateBucket(appointmentDate, appointmentIdStr);

      if (inv.investigations?.length > 0) {
        for (const invId of inv.investigations) {
          if (!invId) continue;

          const invData = investigationsMap[invId.toString()];
          if (!invData) continue;

          const invObj = {
            investigationId: invId,
            name: invData.name || "Unknown Investigation",
            description: invData.description || "",
            category: invData.category || "",
          };

          // Additional safety check before push
          if (
            datewiseData[appointmentDate] &&
            datewiseData[appointmentDate].investigations
          ) {
            datewiseData[appointmentDate].investigations.push(invObj);
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Past patient clinical data fetched successfully.",
      data: datewiseData,
      pastDates, // optional — your frontend may stop using this
    });
  } catch (error) {
    console.error("Error fetching past patient data:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// allergy

export const getAllergies = async (req, res) => {
  try {
    const allergies = await Allergy.find({});
    return res.status(200).json({
      success: true,
      allergies: allergies,
    });
  } catch (error) {
    console.log("Error fetching allergies:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const upsetAllergy = async (req, res) => {
  try {
    const { allergyName, patientId } = req.body;

    const isAllergyExists = await Appoinment.findOne({
      patientId: patientId,
      allergies: { $in: [allergyName] }, // ✅ correct usage
    });

    if (isAllergyExists) {
      return res.status(200).json({
        success: false,
        message: "Allergy already exists. Choose a different one.",
      });
    }

    // Add the allergy to the prescription item
    await Appoinment.findOneAndUpdate(
      { patientId: patientId },
      { $addToSet: { allergies: allergyName } },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Allergy added successfully.",
    });
  } catch (error) {
    console.log("Error updating allergy:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getAllergiesByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Valid patientId is required.",
      });
    }

    const appointment = await Appoinment.findOne({
      patientId: patientId,
    });

    if (!appointment || !appointment.allergies) {
      return res.status(404).json({
        success: false,
        message: "No allergies found for this patient.",
      });
    }

    return res.status(200).json({
      success: true,
      allergies: appointment.allergies,
    });
  } catch (error) {
    console.error("Error fetching allergies by patientId:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
