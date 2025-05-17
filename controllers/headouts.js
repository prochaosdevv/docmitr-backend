import Headouts from "../models/Headouts.js";

export const createHeadout = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required." });
    }

    const newHeadout = new Headouts({
      name,
    });

    await newHeadout.save();

    return res.status(201).json({
      message: "Headout created successfully.",
      data: newHeadout,
    });
  } catch (error) {
    console.error("Error creating headout:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
