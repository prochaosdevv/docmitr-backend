import Appoinment from "../models/Appoinment.js";
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
    const {
      patientId,
      doctorId,
      date,
      timeSlot,
      purposeOfVisit,
      complaints,
      mobileNumber,
      email,
      patientClinicId,
      patientUid,
      patientName,
      dateOfBirth,
      ageYears,
      ageMonths,
      caretakerName,
      bloodGroup,
      gender,
      dateOfMarriage,
      marriedYears,
      marriedMonths,
      language,
    } = req.body;

    // Validate core required fields
    if (
      !patientName ||
      !mobileNumber ||
      !date ||
      !timeSlot?.startTime ||
      !purposeOfVisit
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Optional: Check if patient exists if patientId is provided
    if (patientId) {
      const patientExists = await Patient.findById(patientId);
      if (!patientExists) {
        return res.status(404).json({ message: "Patient not found." });
      }
    }

    // Optional: Check if doctor exists if doctorId is provided
    if (doctorId) {
      const doctorExists = await Doctor.findById(doctorId);
      if (!doctorExists) {
        return res.status(404).json({ message: "Doctor not found." });
      }

      // Prevent double booking for doctor
      const existingAppointment = await Appoinment.findOne({
        doctorId,
        date,
        "timeSlot.startTime": timeSlot.startTime,
      });

      if (existingAppointment) {
        return res.status(409).json({
          message: "Doctor already has an appointment at this time.",
        });
      }
    }

    // Create the new appointment entry
    const newAppointment = new Appoinment({
      patientId: patientId || null,
      doctorId: doctorId || null,
      date,
      timeSlot: {
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
      },
      purposeOfVisit,
      complaints: complaints || "",

      mobileNumber,
      email,
      patientClinicId,
      patientUid,
      patientName,
      dateOfBirth,
      ageYears,
      ageMonths,
      caretakerName,
      bloodGroup,
      gender: gender || "Female",
      dateOfMarriage,
      marriedYears,
      marriedMonths,
      language: language || "English",
    });

    await newAppointment.save();

    return res.status(201).json({
      message: "Appointment created successfully",
      data: newAppointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateAppointment = (req, res) => {};

export const deleteAppointment = (req, res) => {};
