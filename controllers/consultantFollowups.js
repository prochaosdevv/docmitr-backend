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
      doctorId: user.role === "doctor" ? user.id : null,
      isAdmin: user.role === "admin" ? true : false,
    });

    if (!symptomProperty) {
      return res.status(404).json({ message: "Symptom property not found." });
    }

    // Clone details array to modify
    let updatedDetails = [...symptomProperty.details];

    // 1. Rename category
    if (renameCategoryId && typeof renameCategoryTo === "string") {
      const categoryIndex = updatedDetails.findIndex(
        (cat) => cat._id.toString() === renameCategoryId
      );
      if (categoryIndex === -1) {
        return res.status(400).json({
          message: `Category with id '${renameCategoryId}' not found.`,
        });
      }
      updatedDetails[categoryIndex].categoryName = renameCategoryTo.trim(); // allow ""
    }

    // 2. Process category updates
    details.forEach((newCategory) => {
      const categoryIndex = updatedDetails.findIndex(
        (cat) => cat._id.toString() === newCategory._id
      );

      if (categoryIndex !== -1) {
        // Update existing category
        const existingCategory = updatedDetails[categoryIndex];

        newCategory.categoryProperties.forEach((newProp) => {
          const propIndex = existingCategory.categoryProperties.findIndex(
            (p) => p._id?.toString() === newProp._id
          );

          if (propIndex !== -1) {
            // ✅ Correctly update property name/value
            existingCategory.categoryProperties[propIndex] = {
              ...existingCategory.categoryProperties[propIndex],
              propertyName: newProp.propertyName,
              propertyValue: newProp.propertyValue,
            };
          } else {
            // Add new property
            existingCategory.categoryProperties.push(newProp);
          }
        });

        updatedDetails[categoryIndex] = existingCategory;
      } else {
        // Add new category
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
      return res.status(404).json({ message: "Symptom not found." });
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

    const symptomProperty = await FindingsProperties.findOne({
      findingsId,
      doctorId: user.role === "doctor" ? user.id : null,
      isAdmin: user.role === "admin" ? true : false,
    });

    if (!symptomProperty) {
      return res.status(404).json({ message: "Finding property not found." });
    }

    // Clone details array to modify
    let updatedDetails = [...symptomProperty.details];

    // 1. Rename category
    if (renameCategoryId && renameCategoryTo) {
      const categoryIndex = updatedDetails.findIndex(
        (cat) => cat._id.toString() === renameCategoryId
      );
      if (categoryIndex === -1) {
        return res.status(400).json({
          message: `Category with id '${renameCategoryId}' not found.`,
        });
      }
      updatedDetails[categoryIndex].categoryName = renameCategoryTo;
    }

    // 2. Process category updates
    details.forEach((newCategory) => {
      const categoryIndex = updatedDetails.findIndex(
        (cat) => cat._id.toString() === newCategory._id
      );

      if (categoryIndex !== -1) {
        // Update existing category
        const existingCategory = updatedDetails[categoryIndex];

        newCategory.categoryProperties.forEach((newProp) => {
          const propIndex = existingCategory.categoryProperties.findIndex(
            (p) => p._id?.toString() === newProp._id
          );

          if (propIndex !== -1) {
            // ✅ Correctly update property name/value
            existingCategory.categoryProperties[propIndex] = {
              ...existingCategory.categoryProperties[propIndex],
              propertyName: newProp.propertyName,
              propertyValue: newProp.propertyValue,
            };
          } else {
            // Add new property
            existingCategory.categoryProperties.push(newProp);
          }
        });

        updatedDetails[categoryIndex] = existingCategory;
      } else {
        // Add new category
        updatedDetails.push(newCategory);
      }
    });

    symptomProperty.details = updatedDetails;
    symptomProperty.markModified("details");
    await symptomProperty.save();

    return res.status(200).json({
      message: "Finding properties updated successfully.",
      data: symptomProperty,
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
      return res.status(404).json({ message: "Finding not found." });
    }

    let filter = {
      symptopId,
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

    const symptomProperty = await DiagnosisProperties.findOne({
      diagnosisId,
      doctorId: user.role === "doctor" ? user.id : null,
      isAdmin: user.role === "admin" ? true : false,
    });

    if (!symptomProperty) {
      return res.status(404).json({ message: "Finding property not found." });
    }

    // Clone details array to modify
    let updatedDetails = [...symptomProperty.details];

    // 1. Rename category
    if (renameCategoryId && renameCategoryTo) {
      const categoryIndex = updatedDetails.findIndex(
        (cat) => cat._id.toString() === renameCategoryId
      );
      if (categoryIndex === -1) {
        return res.status(400).json({
          message: `Category with id '${renameCategoryId}' not found.`,
        });
      }
      updatedDetails[categoryIndex].categoryName = renameCategoryTo;
    }

    // 2. Process category updates
    details.forEach((newCategory) => {
      const categoryIndex = updatedDetails.findIndex(
        (cat) => cat._id.toString() === newCategory._id
      );

      if (categoryIndex !== -1) {
        // Update existing category
        const existingCategory = updatedDetails[categoryIndex];

        newCategory.categoryProperties.forEach((newProp) => {
          const propIndex = existingCategory.categoryProperties.findIndex(
            (p) => p._id?.toString() === newProp._id
          );

          if (propIndex !== -1) {
            // ✅ Correctly update property name/value
            existingCategory.categoryProperties[propIndex] = {
              ...existingCategory.categoryProperties[propIndex],
              propertyName: newProp.propertyName,
              propertyValue: newProp.propertyValue,
            };
          } else {
            // Add new property
            existingCategory.categoryProperties.push(newProp);
          }
        });

        updatedDetails[categoryIndex] = existingCategory;
      } else {
        // Add new category
        updatedDetails.push(newCategory);
      }
    });

    symptomProperty.details = updatedDetails;
    symptomProperty.markModified("details");
    await symptomProperty.save();

    return res.status(200).json({
      message: "Diagnosis properties updated successfully.",
      data: symptomProperty,
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
      return res.status(404).json({ message: "Diagnosis not found." });
    }

    let filter = {
      symptopId,
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
    const selectedCount = parseInt(req.query.selectedCount || "0");

    // Destructure from authenticated user
    const { id, role } = req.user;

    let filter = {
      $or: [{ isAdmin: true }, { doctorId: id }],
    };

    // Fetch all investigations sorted by _id (or customize the sort logic)
    const allInvestigations = await Investigation.find(filter)
      .sort({ _id: 1 })
      .lean();

    // Calculate total items to return: first 6 + 1 for each selected checkbox
    const limit = 6 + selectedCount;
    const visibleInvestigations = allInvestigations.slice(0, limit);

    res.status(200).json({ investigations: visibleInvestigations });
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
    const selectedCount = parseInt(req.query.selectedCount || "0");

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
    const limit = 6 + selectedCount;
    const visibleInvestigations = allInvestigations.slice(0, limit);

    res.status(200).json({ instructions: visibleInvestigations });
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
    const selectedCount = parseInt(req.query.selectedCount || "0");

    // Destructure from authenticated user
    const { id, role } = req.user;

    let filter = {
      $or: [{ isAdmin: true }, { doctorId: id }],
    };

    // Fetch all investigations sorted by _id (or customize the sort logic)
    const allInvestigations = await Procedures.find(filter)
      .sort({ _id: 1 })
      .lean();

    // Calculate total items to return: first 6 + 1 for each selected checkbox
    const limit = 6 + selectedCount;
    const visibleInvestigations = allInvestigations.slice(0, limit);

    res.status(200).json({ procedures: visibleInvestigations });
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

export const getPaginatedMedicines = async (req, res) => {
  try {
    const selectedCount = parseInt(req.query.selectedCount || "0");

    // Destructure from authenticated user
    const { id, role } = req.user;

    let filter = {
      $or: [{ isAdmin: true }, { doctorId: id }],
    };

    // Fetch all medicines sorted by _id (or customize the sort logic)
    const allMedicines = await Medicine.find(filter).sort({ _id: 1 }).lean();

    // Calculate total items to return: first 6 + 1 for each selected checkbox
    const limit = 8 + selectedCount;
    const visibleMedicines = allMedicines.slice(0, limit);

    res.status(200).json({ medicines: visibleMedicines });
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
