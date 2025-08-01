import AdminSettings from "../models/AdminSettings.js";

export const getAdminSettings = async (req, res) => {
  try {
    const adminSettings = await AdminSettings.findOne();
    if (!adminSettings) {
      return res.status(200).json({ message: "Admin settings not found" });
    }
    res.status(200).json(adminSettings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const updateAdminSettings = async (req, res) => {
  try {
    const adminSettings = await AdminSettings.findOneAndUpdate({}, req.body, {
      new: true,
      runValidators: true,
      upsert: true, // ✅ this creates the document if it doesn't exist
    });
    res.status(200).json(adminSettings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const deleteAdminSettings = async (req, res) => {
  try {
    const adminSettings = await AdminSettings.findOneAndDelete({});
    if (!adminSettings) {
      return res.status(404).json({ message: "Admin settings not found" });
    }
    res.status(200).json({ message: "Admin settings deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};
