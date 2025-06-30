import mongoose from "mongoose";
import Appoinment from "../models/Appoinment.js";
import Clinic from "../models/Clinic.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import PatientAddressHistory from "../models/PatientAddressHistory.js";
import {
  isAddressComplete,
  parseDateTimeString,
} from "../utils/helper-functions.js";

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

      if (isAddressComplete(req.body.address)) {
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

    if (isAddressComplete(req.body.address)) {
      await Appoinment.findOneAndUpdate(
        { patientId: patientId },
        {
          $set: {
            address: {
              addressLine1: req.body.address.addressLine1,
              addressLine2: req.body.address.addressLine2,
              city: req.body.address.city,
              state: req.body.address.state,
              district: req.body.address.district,
              country: req.body.address.country,
              pincode: req.body.address.pincode,
              area: req.body.address.area,
            },
          },
        },
        { new: true, runValidators: true }
      );
    }
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

export const updateCheckInCheckOut = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { checkInTime, checkOutTime } = req.body;

    if (!checkInTime && !checkOutTime) {
      return res.status(400).json({
        message: "Please provide checkInTime or checkOutTime",
      });
    }

    const updatedAppointment = await Appoinment.findOneAndUpdate(
      { appointmentId: appointmentId },
      {
        ...(checkInTime && { checkInTime }),
        ...(checkOutTime && { checkOutTime }),
      },
      { new: true }
    );

    if (!updatedAppointment) {
      return res
        .status(404)
        .json({ message: "Appointment not found with this appointmentId" });
    }

    return res.status(200).json({
      message: "Check-in/check-out updated successfully",
      data: updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAppointmentStatsTest = async (req, res) => {
  try {
    const { date } = req.query; // e.g., "27 June 2025"

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const appointments = await Appoinment.find({ appointmentDate: date });

    const totalAppointments = appointments.length;

    let waitingCount = 0;
    let totalWaitingTimeInMinutes = 0;
    let completedAppointments = 0;

    appointments.forEach((appointment) => {
      const { checkInTime, checkOutTime } = appointment;

      if (checkInTime && !checkOutTime) {
        waitingCount += 1;
      }

      if (checkInTime && checkOutTime) {
        const checkIn = parseDateTimeString(checkInTime);
        const checkOut = parseDateTimeString(checkOutTime);

        const diffMs = checkOut - checkIn;
        const diffMinutes = Math.floor(diffMs / 60000);

        totalWaitingTimeInMinutes += diffMinutes;
        completedAppointments += 1;
      }
    });

    const avgWaitingTime =
      completedAppointments > 0
        ? Math.round(totalWaitingTimeInMinutes / completedAppointments)
        : 0;

    return res.status(200).json({
      date,
      totalAppointments,
      waitingCount,
      avgWaitingTimeInMinutes: avgWaitingTime,
    });
  } catch (error) {
    console.error("Error fetching appointment stats:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProcedureDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { procedureDate } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Procedure ID",
      });
    }

    // Validate Date
    if (!procedureDate) {
      return res.status(400).json({
        success: false,
        message: "Procedure date is required",
      });
    }

    const isoDate = new Date(procedureDate);

    if (isNaN(isoDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // Update Procedure Date
    const updatedProcedure = await Appoinment.findByIdAndUpdate(
      id,
      { procedureDate: isoDate },
      { new: true } // Return the updated document
    );

    if (!updatedProcedure) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment procedure date updated successfully",
      data: updatedProcedure,
    });
  } catch (error) {
    console.error("Error updating procedure date:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
