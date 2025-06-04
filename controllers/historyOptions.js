import HistoryOption from "../models/HistoryOption.js";

export const createOptions = async (req, res) => {
  try {
    // Set doctorId from authenticated user
    const doctorId = req.user.id;
    const isAdmin = req.user.role === "admin";

    const data = new HistoryOption({
      ...req.body,
      doctorId,
      isAdmin,
    });

    await data.save();

    // Populate the references before returning
    const populatedData = await HistoryOption.findById(data._id).populate(
      "qId"
    );

    res.status(201).json(populatedData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const filter = {};

    // For non-admin users, only return their own records
    if (req.user.role !== "admin") {
      filter.doctorId = req.user.id;
    }

    // Additional filtering if query parameters are provided
    if (req.query.isAdmin !== undefined) {
      filter.isAdmin = req.query.isAdmin === "true";
    }

    const data = await HistoryOption.find(filter)
      .populate("doctorId")
      .populate("qId")
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const data = await HistoryOption.findById(req.params.id)
      .populate("doctorId")
      .populate("qId");

    if (!data) {
      return res.status(404).json({ error: "HistoryOption not found" });
    }

    // Check authorization - only admin or owner can access
    if (
      req.user.role !== "admin" &&
      data.doctorId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    // First get the existing document to check ownership
    const existingData = await HistoryOption.findById(req.params.id);

    if (!existingData) {
      return res.status(404).json({ error: "HistoryOption not found" });
    }

    // Check authorization - only admin or owner can update
    if (
      req.user.role !== "admin" &&
      existingData.doctorId.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    // Prevent updating doctorId and isAdmin fields
    const updateData = { ...req.body };
    delete updateData.doctorId;
    delete updateData.isAdmin;

    const data = await HistoryOption.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("doctorId")
      .populate("qId");

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    // First get the existing document to check ownership
    const existingData = await HistoryOption.findById(req.params.id);

    if (!existingData) {
      return res.status(404).json({ error: "HistoryOption not found" });
    }

    // Check authorization - only admin or owner can delete
    if (
      req.user.role !== "admin" &&
      existingData.doctorId.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    await HistoryOption.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
