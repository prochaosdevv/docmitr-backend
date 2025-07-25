import VitalMaster from "../models/VitalMaster.js";
import Vital from "../models/Vitals.js";

// Create or Update Vital by date + appointmentId + patientId
export const createOrUpdateVital = async (req, res) => {
  try {
    const { date, appointmentId, patientId, vitalId, vitalValue } = req.body;
    const doctorId = req.user.id;

    if (!date || !appointmentId || !patientId) {
      return res.status(400).json({ error: "Missing required vital fields." });
    }

    // Check if vital already exists for same date, appointment, and patient
    const existingVital = await Vital.findOne({
      date,
      appointmentId,
      patientId,
    });

    if (existingVital) {
      const index = existingVital.vitalsData.findIndex(
        (v) => v.vitalId.toString() === vitalId.toString()
      );

      if (index > -1) {
        // Update existing vital value
        existingVital.vitalsData[index].vitalId = vitalId;
        existingVital.vitalsData[index].vitalValue = vitalValue;
      } else {
        // Add new vital entry
        existingVital.vitalsData.push({
          vitalId,
          vitalValue,
        });
      }

      await existingVital.save();
      return res.status(200).json({ success: true, vitals: existingVital });
    }

    // If not found, create new
    const newVital = new Vital({
      date,
      doctorId,
      appointmentId,
      patientId,
      vitalsData: [{ vitalId, vitalValue }],
    });

    await newVital.save();
    res.status(201).json({ success: true, vitals: newVital });
  } catch (error) {
    console.error("Error saving vital:", error);
    res.status(400).json({ error: error.message });
  }
};

export const getAllVitals = async (req, res) => {
  try {
    const vitals = await Vital.find().sort({ createdAt: -1 });
    res.json(vitals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVitalById = async (req, res) => {
  const { patientId, appointmentId } = req.query;
  try {
    const vitals = await Vital.find({
      appointmentId,
      patientId,
    })
      .sort({ createdAt: -1 })
      .populate("vitalsData.vitalId", "vitalName unitType");

    if (!vitals) {
      return res.status(404).json({ error: "Vital not found" });
    }

    // Transform vitalsData
    const transformedVitals = vitals.map((vital) => ({
      ...vital.toObject(),
      vitalsData: vital.vitalsData.map((entry) => ({
        _id: entry._id, // Keep original subdoc ID
        vitalId: entry.vitalId?._id || null, // Explicitly add vitalId
        vitalValue: entry.vitalValue,
        vitalName: entry.vitalId?.vitalName || "",
        unitType: entry.vitalId?.unitType || "",
      })),
    }));

    res.json(transformedVitals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateVital = async (req, res) => {
  try {
    const updatedVital = await Vital.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedVital) {
      return res.status(404).json({ error: "Vital not found" });
    }
    res.json(updatedVital);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteVital = async (req, res) => {
  try {
    const deletedVital = await Vital.findByIdAndDelete(req.params.id);
    if (!deletedVital) {
      return res.status(404).json({ error: "Vital not found" });
    }
    res.json({ message: "Vital deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllMasterVitals = async (req, res) => {
  try {
    let filter = {
      $or: [{ isAdmin: true }, { doctorId: req.user.id }],
    };

    const vitals = await VitalMaster.find(filter).sort({ sortOrder: 1 }); // Sort by sortOrder ascending

    res.json(vitals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// master

export const createMasterVital = async (req, res) => {
  const { vitalName, unitType } = req.body;

  try {
    if (!vitalName || !unitType) {
      return res
        .status(400)
        .json({ error: "Vital name and unit type are required." });
    }

    const user = req.user;

    const findLastSortOrderNumber = await VitalMaster.find({});

    let sortOrder = 0;
    if (findLastSortOrderNumber.length > 0) {
      sortOrder =
        findLastSortOrderNumber[findLastSortOrderNumber.length - 1].sortOrder +
        1;
    }

    const newVital = new VitalMaster({
      vitalName,
      unitType,
      isAdmin: user.role === "admin",
      doctorId: user.id, // Associate with the logged-in doctor
      sortOrder, // Set the sort order
    });
    await newVital.save();
    res.status(201).json({ success: true, vital: newVital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMasterVitalByDoctor = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const vitals = await VitalMaster.find({ doctorId }).sort({ createdAt: -1 });

    if (!vitals || vitals.length === 0) {
      return res.status(200).json([]);
    }

    res.json(vitals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const updateMasterVital = async (req, res) => {
  const { id } = req.params;
  const { vitalName, unitType } = req.body;

  try {
    if (!vitalName || !unitType) {
      return res
        .status(400)
        .json({ error: "Vital name and unit type are required." });
    }

    const updatedVital = await VitalMaster.findByIdAndUpdate(
      id,
      { vitalName, unitType },
      { new: true, runValidators: true }
    );

    if (!updatedVital) {
      return res.status(404).json({ error: "Vital not found." });
    }

    res.json({ success: true, vital: updatedVital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMasterVital = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedVital = await VitalMaster.findByIdAndDelete(id);

    if (!deletedVital) {
      return res.status(404).json({ error: "Vital not found." });
    }

    res.json({ success: true, message: "Vital deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
