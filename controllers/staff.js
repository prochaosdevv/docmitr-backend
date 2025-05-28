import Staff from "../models/Staff.js";
import Clinic from "../models/Clinic.js";
import bcrypt from "bcryptjs";
import { welcomeEmailStaff } from "../emails.js";
import { sendEmail } from "../utils/send-mail.js";

// Create staff
export const createStaff = async (req, res) => {
  try {
    const { name, email, clinicId, role, department, phone, joinDate, status } =
      req.body;

    const doctorId = req.user.id;

    if (!name || !email || !department || !phone || !joinDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res
        .status(400)
        .json({ message: "Staff with this email already exists" });
    }

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }

    const randomNum = Math.floor(Math.random() * 1000); // up to 999
    const plainPassword = `docmitraStaff${name}${randomNum}`.replace(
      /\s+/g,
      ""
    );

    console.log("Generated password:", plainPassword);

    // Hash the generated password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newStaff = await Staff.create({
      name,
      email,
      password: hashedPassword,
      clinic: clinicId,
      role: role || "staff",
      department,
      phone: `+91 ${phone}`,
      joinDate,
      status: status || "active",
      doctorId,
    });

    const html = welcomeEmailStaff(name, email, plainPassword);

    if (process.env.SEND_EMAIL == "true") {
      const res1 = await sendEmail(
        email,
        "Welcome to Docmitr",
        `Hello ${name}, welcome to Docmitr!`,
        html
      );

      console.log("Email sent successfully:", res1);
    }

    res.status(201).json({
      success: true,
      message: "Staff created successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all staff
export const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().populate("clinic", ["name"]);
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single staff by ID
export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).populate("clinic");
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update staff
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, clinicId, role, department, phone, joinDate, status } =
      req.body;

    if (!name || !email || !department || !phone || !joinDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Check for duplicate email (excluding current staff)
    const existingStaff = await Staff.findOne({ email, _id: { $ne: id } });
    if (existingStaff) {
      return res
        .status(400)
        .json({ message: "Another staff with this email already exists" });
    }

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }

    // Update staff fields
    staff.name = name;
    staff.email = email;
    staff.clinic = clinicId;
    staff.role = role || staff.role;
    staff.department = department;
    staff.phone = `${phone}`;
    staff.joinDate = joinDate;
    staff.status = status || staff.status;

    await staff.save();

    res.status(200).json({
      success: true,
      message: "Staff updated successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete staff
export const deleteStaff = async (req, res) => {
  try {
    const deleted = await Staff.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Staff not found" });
    res.json({ success: true, message: "Staff deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLoggedInStaff = async (req, res) => {
  console.log("Logged in staff ID:", req.user);
  try {
    const staffId = req.user.id;

    // Find the doctor by ID
    const doctor = await Staff.findById(staffId).lean().select("-password");

    if (!doctor) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const final = {
      ...doctor,
      role: "staff",
    };

    res.json(final);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
