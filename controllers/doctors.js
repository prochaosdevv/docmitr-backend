import { db, findById, findAll, create, update, remove } from "../db/index.js";
import { welcomeEmail } from "../emails.js";
import Doctor from "../models/Doctor.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/send-mail.js";

export const getDoctors = async (req, res) => {
  try {
    const result = await Doctor.find({})
      .select(
        "firstName lastName specialization subscriptionType address city state zipCode active"
      )
      .lean();
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).lean();

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLoggedInDoctor = async (req, res) => {
  try {
    const doctorId = req.user.id;

    // Find the doctor by ID
    const doctor = await Doctor.findById(doctorId).lean().select("-password");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const final = {
      ...doctor,
      role: "doctor",
    };

    res.json(final);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createDoctor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      specialization,
      email,
      phone,
      bio,
      consultationFee,
      subscriptionType,
      address,
      city,
      state,
      zipCode,
    } = req.body;

    // Check if the doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    // Generate a random number up to 3 digits (0–999)
    const randomNum = Math.floor(Math.random() * 1000); // up to 999
    const plainPassword = `docmitra${firstName}${randomNum}`.replace(
      /\s+/g,
      ""
    );

    console.log("Generated password:", plainPassword);

    // Hash the generated password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Create new doctor with generated password
    const newDoctor = await Doctor.create({
      firstName,
      lastName,
      specialization,
      email,
      password: hashedPassword,
      phone: `+91 ${phone}`,
      bio,
      consultationFee,
      subscriptionType,
      address,
      city,
      state,
      zipCode,
    });

    // send welcome email with the generated password and email
    const html = welcomeEmail(firstName + " " + lastName, email, plainPassword);

    if (process.env.SEND_EMAIL == "true") {
      const res1 = await sendEmail(
        email,
        "Welcome to Docmitr",
        `Hello ${firstName}, welcome to Docmitr!`,
        html
      );

      console.log("Email sent successfully:", res1);
    }

    // Optionally return the plain password (e.g. to send in email)
    res.status(201).json({
      doctor: newDoctor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      specialization,
      email,
      phone,
      bio,
      consultationFee,
      subscriptionType,
      address,
      city,
      state,
      zipCode,
    } = req.body;

    const { id } = req.params;

    // Find the doctor by ID
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Update only allowed fields (not password)
    doctor.firstName = firstName || doctor.firstName;
    doctor.lastName = lastName || doctor.lastName;
    doctor.specialization = specialization || doctor.specialization;
    doctor.email = email || doctor.email;
    doctor.phone = phone ? `+91 ${phone}` : doctor.phone;
    doctor.bio = bio || doctor.bio;
    doctor.consultationFee = consultationFee || doctor.consultationFee;
    doctor.subscriptionType = subscriptionType || doctor.subscriptionType;
    doctor.address = address || doctor.address;
    doctor.city = city || doctor.city;
    doctor.state = state || doctor.state;
    doctor.zipCode = zipCode || doctor.zipCode;

    // Save the updated doctor
    await doctor.save();

    res.status(200).json({
      doctor,
      message: "Doctor updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteDoctorByid = async (req, res) => {
  try {
    const doctorId = req.params.id;

    const deletedDoctor = await Doctor.findByIdAndDelete(doctorId);

    if (!deletedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDoctorAppointments = (req, res) => {
  try {
    const doctorId = req.params.id;
    const appointments = db.appointments.filter((a) => a.doctorId === doctorId);

    // Enrich with patient information
    const enrichedAppointments = appointments.map((appointment) => {
      const patient = findById("patients", appointment.patientId);
      return {
        ...appointment,
        patient: patient
          ? {
              id: patient.id,
              name: `${patient.firstName} ${patient.lastName}`,
              avatar: patient.avatar,
            }
          : null,
      };
    });

    res.json({
      data: enrichedAppointments,
      pagination: {
        total: enrichedAppointments.length,
        page: 1,
        limit: enrichedAppointments.length,
        pages: 1,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDoctorPatients = (req, res) => {
  try {
    const doctorId = req.params.id;

    // Get all appointments for this doctor
    const appointments = db.appointments.filter((a) => a.doctorId === doctorId);

    // Get unique patient IDs
    const patientIds = [...new Set(appointments.map((a) => a.patientId))];

    // Get patient details
    const patients = patientIds
      .map((id) => findById("patients", id))
      .filter(Boolean);

    res.json({
      data: patients,
      pagination: {
        total: patients.length,
        page: 1,
        limit: patients.length,
        pages: 1,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const toggleDoctorStatus = async (req, res) => {
  try {
    const doctorId = req.params.id;

    // Find the doctor by ID
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Toggle the active status
    doctor.active = !doctor.active;

    // Save the updated doctor
    await doctor.save();

    res.json({
      message: `Doctor ${
        doctor.active ? "activated" : "deactivated"
      } successfully`,
      doctor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
