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
    const vitals = await VitalMaster.find().sort({ sortOrder: 1 }); // Sort by sortOrder ascending

    res.json(vitals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
