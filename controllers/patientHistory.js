import PatientHistory from "../models/PatientHistory.js";

export const create = async (req, res) => {
  try {
    const data = new PatientHistory(req.body);
    await data.save();
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
export const getAll = async (req, res) => {
  try {
    const data = await PatientHistory.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const update = async (req, res) => {
  try {
    const data = await PatientHistory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
export const remove = async (req, res) => {
  try {
    await PatientHistory.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
