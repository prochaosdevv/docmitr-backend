import LabTestPatient from "../models/LabTestPatient.js";
import LabTests from "../models/LabTests.js";
import LabTestsProperties from "../models/LabTestsProperties.js";

const normalizeStatus = (str) => {
  if (!str) return str;
  const lower = str.toLowerCase();
  if (["normal", "abnormal"].includes(lower)) {
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
  return str; // return as is for others (you can expand logic if needed)
};

const normalizePropertyStatus = (str) => {
  if (!str) return str;
  const lower = str.toLowerCase();
  if (["up", "high", "normal", "low"].includes(lower)) {
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
  return str;
};

// Get all lab test names
export const getLabTestRecords = async (req, res) => {
  try {
    const results = await LabTests.find({});
    return res.status(200).json({
      success: true,
      labTests: results,
    });
  } catch (error) {
    console.log("Error in getLabTestRecords:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get parameters for a specific lab test by its ID
export const getLabPropertiesByTestId = async (req, res) => {
  const { labTestId } = req.params;
  try {
    const labProperties = await LabTestsProperties.findOne({ labTestId });

    if (!labProperties) {
      return res.status(200).json({
        message: "Lab test properties not found",
        labProperties: {
          params: [],
          labTestId: labTestId,
        },
      });
    }

    return res.status(200).json({
      success: true,
      labProperties,
    });
  } catch (error) {
    console.log("Error in getLabPropertiesByTestId:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addOrUpdateLabTestPatient = async (req, res) => {
  try {
    const {
      patientId,
      labTestId,
      registeredvalue,
      status,
      impression,
      reportDate,
    } = req.body;
    const doctorId = req.user.id;

    if (!patientId || !labTestId || !Array.isArray(registeredvalue)) {
      return res.status(400).json({
        success: false,
        message: "patientId, labTestId and registeredvalue[] are required.",
      });
    }

    // Normalize inputs
    const normalizedRegisteredValue = registeredvalue
      .map((item) => ({
        ...item,
        propertyStatus: normalizePropertyStatus(item.propertyStatus),
      }))
      .filter((item) => item.propertyValue !== "0");

    const normalizedStatus = normalizeStatus(status);

    const existingEntry = await LabTestPatient.findOne({
      patientId,
      labTestId,
    });

    // Helper function to check if all meaningful fields are empty
    const isDataEmpty = (regVal, impr) => {
      const isRegValEmpty =
        !regVal || (Array.isArray(regVal) && regVal.length === 0);
      const isImprEmpty =
        impr === undefined || impr === null || impr.toString().trim() === "";
      return isRegValEmpty && isImprEmpty;
    };

    if (existingEntry) {
      // If all meaningful fields are empty, delete the entry
      if (isDataEmpty(normalizedRegisteredValue, impression)) {
        await LabTestPatient.deleteOne({ _id: existingEntry._id });
        return res.status(200).json({
          success: true,
          message: "Lab test entry removed as all data was cleared.",
        });
      }

      // Otherwise update fields normally
      if (normalizedRegisteredValue.length > 0) {
        existingEntry.registeredvalue = normalizedRegisteredValue;
      } else {
        existingEntry.registeredvalue = [];
      }

      if (normalizedStatus) {
        existingEntry.status = normalizedStatus;
      }

      if (impression !== undefined) {
        existingEntry.impression = impression;
      }

      await existingEntry.save();

      return res.status(200).json({
        success: true,
        message: "Lab test entry updated successfully.",
        data: existingEntry,
      });
    }

    // For new entry creation, if data is empty, just don't create it
    if (isDataEmpty(normalizedRegisteredValue, impression)) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot create lab test entry with empty registered values and impression.",
      });
    }

    const newEntry = new LabTestPatient({
      reportDate: reportDate || new Date(),
      patientId,
      doctorId,
      labTestId,
      registeredvalue: normalizedRegisteredValue,
      status: normalizedStatus || "Normal",
      impression: impression || null,
    });

    await newEntry.save();

    return res.status(201).json({
      success: true,
      message: "Lab test entry created successfully.",
      data: newEntry,
    });
  } catch (err) {
    console.error("Error in addOrUpdateLabTestPatient:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

export const getLabTestsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId parameter is required.",
      });
    }

    const labTests = await LabTestPatient.find({ patientId })
      .populate("patientId", "name")
      .populate("doctorId", "name")
      .populate("labTestId", "testName")
      .sort({ reportDate: -1 });

    // Loop through labTests to attach property names from LabTestsProperties
    const enhancedLabTests = await Promise.all(
      labTests.map(async (report) => {
        const labProperties = await LabTestsProperties.findOne({
          labTestId: report.labTestId._id,
        });

        const mappedValues = report.registeredvalue.map((reg) => {
          const match = labProperties?.params?.find(
            (p) => p._id.toString() === reg.propertyId?.toString()
          );

          return {
            ...reg.toObject(),
            propertyName: match?.propertyName || "Unknown",
            propertyUnit: match?.propertyUnit || null,
          };
        });

        return {
          ...report.toObject(),
          registeredvalue: mappedValues,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: enhancedLabTests,
    });
  } catch (err) {
    console.error("Error fetching lab tests by patientId:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

export const deleteLabTestPatient = async (req, res) => {
  try {
    const { testId } = req.params;

    if (!testId) {
      return res.status(400).json({
        success: false,
        message: "ID parameter is required.",
      });
    }

    const deletedEntry = await LabTestPatient.findByIdAndDelete(testId);

    if (!deletedEntry) {
      return res.status(404).json({
        success: false,
        message: "Lab test entry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lab test entry deleted successfully.",
      data: deletedEntry,
    });
  } catch (err) {
    console.error("Error deleting lab test entry:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};
