import mongoose from "mongoose";
import Appoinment from "../models/Appoinment.js";
import Clinic from "../models/Clinic.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appoinment.find();
    return res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAppointmentById = (req, res) => {};

export const createAppointment = async (req, res) => {
  try {
    const { clinicId, date, ...appointmentData } = req.body;

    const doctorId = req.body.doctorId || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }

    console.log("Using Doctor ID:", doctorId);

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const patient = await Patient.findOne({ email: req.body.email });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const existingAppointment = await Appoinment.findOne({
      doctorId,
      clinicId,
      email: req.body.email,
      appointmentDate: appointmentData.appointmentDate,
    });

    if (existingAppointment) {
      return res.status(400).json({ message: "Appointment already exists" });
    }

    // Generate custom appointmentId
    const lastAppointment = await Appoinment.findOne({})
      .sort({ createdAt: -1 }) // latest one
      .select("appointmentId");

    let nextId = 1001; // start from DM1001
    if (lastAppointment && lastAppointment.appointmentId) {
      const match = lastAppointment.appointmentId.match(/^DM(\d+)$/);
      if (match) {
        nextId = parseInt(match[1]) + 1;
      }
    }

    const appointmentId = `DM${nextId}`;

    const newAppointment = new Appoinment({
      appointmentId,
      doctorId,
      clinicId,
      ...appointmentData,
    });

    await newAppointment.save();

    return res.status(201).json({
      message: "Appointment created successfully",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAppointmentByIds = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { date, timeEnv = "morning" } = req.query;

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }

    // get appointments by clinicId and date
    const appointments = await Appoinment.find({
      clinicId,
      appointmentDate: date,
      appointmentSession: timeEnv,
    });

    if (!appointments || appointments.length === 0) {
      return res.status(200).json({ appointments: [] });
    }

    return res.status(200).json({
      message: "Appointments fetched successfully",
      appointments,
    });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAppointment = (req, res) => {};

export const deleteAppointment = (req, res) => {};

export const getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appoinment.findOne({
      appointmentId,
    }).populate("doctorId", ["firstName", "lastName", "email", "phone"]);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const clinic = await Clinic.findById(appointment.clinicId);
    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }

    const patient = await Patient.findById(appointment.patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.status(200).json({
      message: "Appointment details fetched successfully",
      appointment: {
        ...appointment._doc,
        clinic: {
          name: clinic.name,
        },
        patient: {
          name: patient.name,
          email: patient.email,
          ageYears: patient.ageYears,
          ageMonths: patient.ageMonths,
          phone: patient.phone,
          gender: patient.gender,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    res.status(500).json({ message: "Server error" });
  }
};
