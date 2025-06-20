import mongoose from "mongoose";
import Appoinment from "../models/Appoinment.js";
import Clinic from "../models/Clinic.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import PatientAddressHistory from "../models/PatientAddressHistory.js";

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

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const patient = await Patient.findOne({ email: req.body.email });
    let newPatient;
    if (!patient) {
      // create a new patient if not found
      const latestPatient = await Patient.findOne()
        .sort({ createdAt: -1 })
        .select("patientId")
        .lean();

      let nextPatientId = "P-1001";

      if (latestPatient && latestPatient.patientId) {
        const lastNumber = parseInt(
          latestPatient.patientId.split("-")[1] || "1000",
          10
        );
        nextPatientId = `P-${lastNumber + 1}`;
      }

      // Check if this patientId already exists (shouldn't usually happen)
      const existingPatient = await Patient.findOne({
        patientId: nextPatientId,
      });

      if (existingPatient) {
        return res.status(400).json({ message: "Patient already exists" });
      }

      let dataToentry = (newPatient = new Patient({
        patientId: nextPatientId,
        clinicSpecificId: req.body.clinicSpecificId || "",
        language: req.body.language || null,
        name: req.body.patientName,
        flag: req.body.flag || "",
        email: req.body.email,
        phone: req.body.mobileNumber,
        dobYear: req.body.dateOfBirth.split("/")[2] || null,
        dobMonth: req.body.dateOfBirth.split("/")[1] || null,
        dobDate: req.body.dateOfBirth.split("/")[0] || null,
        address1: req.body.address?.addressLine1 || "",
        address2: req.body.address?.addressLine2 || "",
        area: req.body.address?.area || "",
        pincode: req.body.address?.pincode || "",
        city: req.body.address?.city || "",
        country: req.body.address?.country || "India",
        state: req.body.address?.state || "",
        district: req.body.address?.district || "",
        bloodGroup: req.body.bloodGroup || "",
        ageYears: req.body.ageYears,
        ageMonths: req.body.ageMonths,
        caretakerName: req.body.caretakerName || null,
        domDate: req.body?.dateOfMarriage
          ? req.body.dateOfMarriage.split("/")[0]
          : null,
        domMonth: req.body?.dateOfMarriage
          ? req.body.dateOfMarriage.split("/")[1]
          : null,
        domYear: req.body?.dateOfMarriage
          ? req.body.dateOfMarriage.split("/")[2]
          : null,
        gender: req.body.gender,
        patientClinicId: req.body.patientClinicId || 1550,
        purposeOfVisit: req.body.purposeOfVisit || null,
        patientUID: req.body.uid || null,
        thirdPartyUID: req.body.thirdPartyUid || null,
      }));

      await newPatient.save();

      await PatientAddressHistory.create({
        patientId: newPatient._id,
        address1: newPatient.address1,
        address2: newPatient.address2 || "",
        area: newPatient.area || "",
        pincode: newPatient.pincode || "",
        city: newPatient.city || "",
        district: newPatient.district || "",
        state: newPatient.state || "",
        country: newPatient.country || "India",
      });
    }

    // const existingAppointment = await Appoinment.findOne({
    //   doctorId,
    //   clinicId,
    //   email: req.body.email,
    //   appointmentDate: appointmentData.appointmentDate,
    // });

    // if (existingAppointment) {
    //   return res.status(400).json({ message: "Appointment already exists" });
    // }

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

    const patientId = patient?._id || newPatient?._id || req.body.patientId;

    const newAppointment = new Appoinment({
      appointmentId,
      doctorId,
      clinicId,
      patientId,
      ...appointmentData,
    });

    await newAppointment.save();

    await Appoinment.findOneAndUpdate(
      { patientId: patientId },
      {
        $set: {
          address: {
            addressLine1: req.body.address?.addressLine1 || "",
            addressLine2: req.body.address?.addressLine2 || "",
            city: req.body.address?.city || "",
            state: req.body.address?.state || "",
            district: req.body.address?.district || "",
            country: req.body.address?.country || "India",
            pincode: req.body.address?.pincode || "",
            area: req.body.address?.area || "",
          },
        },
      },
      { new: true, runValidators: true }
    );

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
          flag: patient.flag,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    res.status(500).json({ message: "Server error" });
  }
};
