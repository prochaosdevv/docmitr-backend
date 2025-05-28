import Vital from "../models/Vitals.js";

export const createVital = async (req, res) => {
  try {
    const { data, appointmentId, patientId } = req.body; // `data` is the array of vitals
    const doctorId = req.user.id;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: "No vital data provided." });
    }

    const createdVitals = [];

    for (const entry of data) {
      const { date, ...vitalData } = entry;

      const vital = new Vital({
        date,
        appointmentId,
        patientId,
        doctorId,
        ...vitalData,
      });

      await vital.save();
      createdVitals.push(vital);
    }

    res.status(201).json({ success: true, vitals: createdVitals });
  } catch (error) {
    console.error("Error creating vitals:", error);
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
    const vital = await Vital.find({
      appointmentId: appointmentId,
      patientId: patientId,
    });
    if (!vital) {
      return res.status(404).json({ error: "Vital not found" });
    }
    res.json(vital);
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
