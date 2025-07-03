import DoctorReference from "../models/DoctorReference.js";

// Create
export const createDoctorReference = async (req, res) => {
  try {
    const { name, specialization, mobile, email } = req.body;

    const newRef = new DoctorReference({ name, specialization, mobile, email });
    const savedRef = await newRef.save();

    res.status(201).json({ success: true, data: savedRef });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Creation failed", error: err.message });
  }
};

// Read all
export const getAllDoctorReferences = async (req, res) => {
  try {
    const references = await DoctorReference.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: references });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Fetch failed", error: err.message });
  }
};

// Update
export const updateDoctorReference = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialization, mobile, email } = req.body;

    const updated = await DoctorReference.findByIdAndUpdate(
      id,
      { name, specialization, mobile, email },
      { new: true }
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Reference not found" });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Update failed", error: err.message });
  }
};

// Delete
export const deleteDoctorReference = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await DoctorReference.findByIdAndDelete(id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Reference not found" });

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Deletion failed", error: err.message });
  }
};
