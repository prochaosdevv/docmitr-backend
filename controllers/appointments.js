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
import PatientSymptoms from "../models/PatientSymptoms.js";
import { PrescriptionItem } from "../models/PatientMedicine.js";
import PatientInvestigation from "../models/PatientInvestigation.js";
import Symptoms from "../models/Symptoms.js";
import Findings from "../models/Findings.js";
import Diagnosis from "../models/Diagnosis.js";
import Medicine from "../models/Medicine.js";
import Investigation from "../models/Investigation.js";
import Instructions from "../models/Instructions.js";
import Procedures from "../models/Procedures.js";
import SymptomsProperties from "../models/SymptomsProperties.js";
import FindingsProperties from "../models/FindingsProperties.js";
import DiagnosisProperties from "../models/DiagnosisProperties.js";

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
          customFlagText: patient.customFlagText,
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

    if (checkInTime === undefined && checkOutTime === undefined) {
      return res.status(400).json({
        message: "Please provide checkInTime or checkOutTime",
      });
    }

    // check if already checked in or checked out
    const existingAppointment = await Appoinment.findOne({
      appointmentId: appointmentId,
    });

    if (existingAppointment.checkInTime !== null && checkInTime !== undefined) {
      return res.status(200).json({
        message: "Appointment already checked in",
      });
    }

    if (
      existingAppointment.checkOutTime !== null &&
      checkOutTime !== undefined
    ) {
      return res.status(200).json({
        message: "Appointment already checked out",
      });
    }

    const updateFields = {};
    if (checkInTime !== undefined) updateFields.checkInTime = checkInTime;
    if (checkOutTime !== undefined) updateFields.checkOutTime = checkOutTime;

    const updatedAppointment = await Appoinment.findOneAndUpdate(
      { appointmentId: appointmentId },
      updateFields,
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
    const { date, timeEnv = "morning" } = req.query; // e.g., "27 June 2025"

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const doctorId = req.user.id;

    const appointments = await Appoinment.find({
      appointmentDate: date,
      doctorId: doctorId,
      appointmentSession: timeEnv,
    });

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
      completedAppointments,
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

export const updateNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { noteType, value } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Appointment ID",
      });
    }

    if (!noteType || typeof value !== "string") {
      return res.status(400).json({
        success: false,
        message: "Note type and value are required",
      });
    }

    const validNoteTypes = ["prescriptionNotes", "doctorNotes", "clinicNotes"];

    if (!validNoteTypes.includes(noteType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note type",
      });
    }

    let update = { [noteType]: value };

    if (noteType === "clinicNotes") {
      // Ensure clinicNotes is a string
      update.clinicNotes = value;
    }

    const updatedAppointment = await Appoinment.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment notes updated successfully",
      data: updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment notes:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateAppointmentPurposeofVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { purposeOfVisit } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Appointment ID",
      });
    }

    if (!purposeOfVisit || typeof purposeOfVisit !== "string") {
      return res.status(400).json({
        success: false,
        message: "Purpose of visit is required and must be a string",
      });
    }

    const updatedAppointment = await Appoinment.findByIdAndUpdate(
      id,
      { purposeOfVisit },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment purpose of visit updated successfully",
    });
  } catch (error) {
    console.error("Error updating appointment purpose of visit:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    const deletedAppointment = await Appoinment.findByIdAndDelete(id);

    if (!deletedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    return res.status(200).json({
      message: "Appointment deleted successfully",
      appointment: deletedAppointment,
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAppointmentDataById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    const appointment = await Appoinment.findOne({ appointmentId: id });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const appointmentId = appointment._id;

    const patientItems = await PatientSymptoms.find({ appointmentId });
    const medicineItems = await PrescriptionItem.find({ appointmentId });
    const patientInvestigation = await PatientInvestigation.findOne({
      appointmentId,
    });

    if (
      (!patientItems || patientItems.length === 0) &&
      (!medicineItems || medicineItems.length === 0) &&
      !patientInvestigation
    ) {
      return res.status(200).json({
        success: false,
        message: "No data found for this appointment",
        data: {
          appointmentId,
        },
      });
    }

    const symptomIds = patientItems.map((item) => item.symptomId);
    const medicineIds = medicineItems.map((item) => item.medicineId);
    const investigationIds = patientInvestigation?.investigations || [];
    const instructionIds = patientInvestigation?.instructions || [];
    const procedureIds = patientInvestigation?.procedures || [];

    const [allSymptoms, allFindings, allDiagnosis, allMedicines] =
      await Promise.all([
        Symptoms.find({ _id: { $in: symptomIds } }),
        Findings.find({ _id: { $in: symptomIds } }),
        Diagnosis.find({ _id: { $in: symptomIds } }),
        Medicine.find({ _id: { $in: medicineIds } }),
      ]);

    const [allInvestigations, allInstructions, allProcedures] =
      await Promise.all([
        Investigation.find({ _id: { $in: investigationIds } }),
        Instructions.find({ _id: { $in: instructionIds } }),
        Procedures.find({ _id: { $in: procedureIds } }),
      ]);

    const mapById = (items) => {
      const map = {};
      items.forEach((item) => {
        map[item._id.toString()] = item.toObject();
      });
      return map;
    };

    const symptomsMap = mapById(allSymptoms);
    const findingsMap = mapById(allFindings);
    const diagnosisMap = mapById(allDiagnosis);
    const medicinesMap = mapById(allMedicines);
    const investigationsMap = mapById(allInvestigations);
    const instructionsMap = mapById(allInstructions);
    const proceduresMap = mapById(allProcedures);

    const result = {
      appointmentId,
      symptoms: [],
      findings: [],
      diagnosis: [],
      medicines: [],
      investigations: [],
      instructions: [],
      procedures: [],
    };

    for (const item of patientItems) {
      const symptomId = item.symptomId.toString();
      let type = "unknown";
      let data = null;

      if (symptomsMap[symptomId]) {
        type = "symptom";
        data = symptomsMap[symptomId];
      } else if (findingsMap[symptomId]) {
        type = "finding";
        data = findingsMap[symptomId];
      } else if (diagnosisMap[symptomId]) {
        type = "diagnosis";
        data = diagnosisMap[symptomId];
      }

      if (!data) continue;

      const obj = {
        symptomId: item.symptomId,
        name: data.name || "Unknown",
        note: item.note || null,
        type,
        details: [],
      };

      if (type === "diagnosis") {
        obj.location = item.location || null;
        obj.description = item.description || null;
      } else {
        obj.since = item.since || null;
        obj.severity = item.severity || null;
      }

      let propertiesDoc = null;
      if (type === "symptom") {
        propertiesDoc = await SymptomsProperties.findOne({
          symptopId: item.symptomId,
        });
      } else if (type === "finding") {
        propertiesDoc = await FindingsProperties.findOne({
          findingsId: item.symptomId,
        });
      } else if (type === "diagnosis") {
        propertiesDoc = await DiagnosisProperties.findOne({
          diagnosisId: item.symptomId,
        });
      }

      if (item.details?.length > 0) {
        for (const detail of item.details) {
          const detailObj = {
            categoryId: detail.detailId,
            categoryName: "",
            properties: [],
          };

          const matchedDetail = propertiesDoc?.details?.find(
            (d) => d._id.toString() === detail.detailId.toString()
          );

          if (matchedDetail) {
            detailObj.categoryName = matchedDetail.categoryName || "";
            for (const prop of detail.properties || []) {
              const matchedProp = matchedDetail.categoryProperties?.find(
                (p) => p._id.toString() === prop.propertyId.toString()
              );
              detailObj.properties.push({
                propertyId: prop.propertyId,
                propertyName: matchedProp?.propertyName || "",
                propertyValue: prop.propertyValue,
              });
            }
          }

          obj.details.push(detailObj);
        }
      }

      // Push to correct array
      if (type === "symptom") {
        result.symptoms.push(obj);
      } else if (type === "finding") {
        result.findings.push(obj);
      } else if (type === "diagnosis") {
        result.diagnosis.push(obj);
      }
    }

    // MEDICINES
    for (const item of medicineItems) {
      const medicineId = item.medicineId.toString();
      const data = medicinesMap[medicineId];
      if (!data) continue;

      const medicineObj = {
        medicineId,
        name: data.name || "Unknown Medicine",
        compositionName: data.compositionName || "",
        doses: [],
      };

      for (const dose of item.doses || []) {
        medicineObj.doses.push({
          doseNumber: dose.doseNumber,
          quantity: dose.quantity,
          dosage: dose.dosage,
          timing: dose.timing,
          duration: dose.duration,
          note: dose.note || "",
          prescriptionType: dose.prescriptionType || "",
        });
      }

      result.medicines.push(medicineObj);
    }

    // INVESTIGATIONS
    result.investigations = investigationIds
      .map((id) => {
        const data = investigationsMap[id.toString()];
        return data
          ? {
              _id: id,
              name: data.name || "",
              description: data.description || "",
              category: data.category || "",
            }
          : null;
      })
      .filter(Boolean);

    // INSTRUCTIONS
    result.instructions = instructionIds
      .map((id) => {
        const data = instructionsMap[id.toString()];
        return data
          ? {
              _id: id,
              name: data.name || "",
              description: data.description || "",
            }
          : null;
      })
      .filter(Boolean);

    // PROCEDURES
    result.procedures = procedureIds
      .map((id) => {
        const data = proceduresMap[id.toString()];
        return data
          ? {
              _id: id,
              name: data.name || "",
              description: data.description || "",
              duration: data.duration || "",
            }
          : null;
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in getAppointmentDataById:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getFollowUpDataByPatientId = async (req, res) => {
  try {
    const { patientId, currentAppointmentId } = req.params;

    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Valid patientId is required.",
      });
    }

    const pastAppointment = await Appoinment.findOne({
      patientId,
      _id: { $ne: currentAppointmentId }, // Exclude current appointment
    })
      .sort({ createdAt: -1, _id: -1 }) // Sort by creation date, then by ID
      .exec();

    if (!pastAppointment) {
      return res.status(200).json({
        success: false,
        message: "No previous appointment found for this patient.",
        data: null,
      });
    }

    // Use the appointment._id for fetching associated data
    const appointmentId = pastAppointment._id;

    const [patientItems, medicineItems, patientInvestigation] =
      await Promise.all([
        PatientSymptoms.find({ appointmentId }),
        PrescriptionItem.find({ appointmentId }),
        PatientInvestigation.findOne({ appointmentId }),
      ]);

    if (
      (!patientItems || patientItems.length === 0) &&
      (!medicineItems || medicineItems.length === 0) &&
      !patientInvestigation
    ) {
      return res.status(200).json({
        success: false,
        message: "No data found for this appointment",
        data: {
          appointmentId,
        },
      });
    }

    const symptomIds = patientItems.map((item) => item.symptomId);
    const medicineIds = medicineItems.map((item) => item.medicineId);
    const investigationIds = patientInvestigation?.investigations || [];
    const instructionIds = patientInvestigation?.instructions || [];
    const procedureIds = patientInvestigation?.procedures || [];

    const [allSymptoms, allFindings, allDiagnosis, allMedicines] =
      await Promise.all([
        Symptoms.find({ _id: { $in: symptomIds } }),
        Findings.find({ _id: { $in: symptomIds } }),
        Diagnosis.find({ _id: { $in: symptomIds } }),
        Medicine.find({ _id: { $in: medicineIds } }),
      ]);

    const [allInvestigations, allInstructions, allProcedures] =
      await Promise.all([
        Investigation.find({ _id: { $in: investigationIds } }),
        Instructions.find({ _id: { $in: instructionIds } }),
        Procedures.find({ _id: { $in: procedureIds } }),
      ]);

    const mapById = (items) => {
      const map = {};
      items.forEach((item) => {
        map[item._id.toString()] = item.toObject();
      });
      return map;
    };

    const symptomsMap = mapById(allSymptoms);
    const findingsMap = mapById(allFindings);
    const diagnosisMap = mapById(allDiagnosis);
    const medicinesMap = mapById(allMedicines);
    const investigationsMap = mapById(allInvestigations);
    const instructionsMap = mapById(allInstructions);
    const proceduresMap = mapById(allProcedures);

    const result = {
      appointmentId,
      symptoms: [],
      findings: [],
      diagnosis: [],
      medicines: [],
      investigations: [],
      instructions: [],
      procedures: [],
    };

    for (const item of patientItems) {
      const symptomId = item.symptomId.toString();
      let type = "unknown";
      let data = null;

      if (symptomsMap[symptomId]) {
        type = "symptom";
        data = symptomsMap[symptomId];
      } else if (findingsMap[symptomId]) {
        type = "finding";
        data = findingsMap[symptomId];
      } else if (diagnosisMap[symptomId]) {
        type = "diagnosis";
        data = diagnosisMap[symptomId];
      }

      if (!data) continue;

      const obj = {
        symptomId: item.symptomId,
        name: data.name || "Unknown",
        note: item.note || null,
        type,
        details: [],
      };

      if (type === "diagnosis") {
        obj.location = item.location || null;
        obj.description = item.description || null;
      } else {
        obj.since = item.since || null;
        obj.severity = item.severity || null;
      }

      let propertiesDoc = null;
      if (type === "symptom") {
        propertiesDoc = await SymptomsProperties.findOne({
          symptopId: item.symptomId,
        });
      } else if (type === "finding") {
        propertiesDoc = await FindingsProperties.findOne({
          findingsId: item.symptomId,
        });
      } else if (type === "diagnosis") {
        propertiesDoc = await DiagnosisProperties.findOne({
          diagnosisId: item.symptomId,
        });
      }

      if (item.details?.length > 0) {
        for (const detail of item.details) {
          const detailObj = {
            categoryId: detail.detailId,
            categoryName: "",
            properties: [],
          };

          const matchedDetail = propertiesDoc?.details?.find(
            (d) => d._id.toString() === detail.detailId.toString()
          );

          if (matchedDetail) {
            detailObj.categoryName = matchedDetail.categoryName || "";
            for (const prop of detail.properties || []) {
              const matchedProp = matchedDetail.categoryProperties?.find(
                (p) => p._id.toString() === prop.propertyId.toString()
              );
              detailObj.properties.push({
                propertyId: prop.propertyId,
                propertyName: matchedProp?.propertyName || "",
                propertyValue: prop.propertyValue,
              });
            }
          }

          obj.details.push(detailObj);
        }
      }

      if (type === "symptom") result.symptoms.push(obj);
      else if (type === "finding") result.findings.push(obj);
      else if (type === "diagnosis") result.diagnosis.push(obj);
    }

    for (const item of medicineItems) {
      const medicineId = item.medicineId.toString();
      const data = medicinesMap[medicineId];
      if (!data) continue;

      const medicineObj = {
        medicineId,
        name: data.name || "Unknown Medicine",
        compositionName: data.compositionName || "",
        doses: [],
      };

      for (const dose of item.doses || []) {
        medicineObj.doses.push({
          doseNumber: dose.doseNumber,
          quantity: dose.quantity,
          dosage: dose.dosage,
          timing: dose.timing,
          duration: dose.duration,
          note: dose.note || "",
          prescriptionType: dose.prescriptionType || "",
        });
      }

      result.medicines.push(medicineObj);
    }

    result.investigations = investigationIds
      .map((id) => {
        const data = investigationsMap[id.toString()];
        return data
          ? {
              _id: id,
              name: data.name || "",
              description: data.description || "",
              category: data.category || "",
            }
          : null;
      })
      .filter(Boolean);

    result.instructions = instructionIds
      .map((id) => {
        const data = instructionsMap[id.toString()];
        return data
          ? {
              _id: id,
              name: data.name || "",
              description: data.description || "",
            }
          : null;
      })
      .filter(Boolean);

    result.procedures = procedureIds
      .map((id) => {
        const data = proceduresMap[id.toString()];
        return data
          ? {
              _id: id,
              name: data.name || "",
              description: data.description || "",
              duration: data.duration || "",
            }
          : null;
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      data: result,
      date: pastAppointment.appointmentDate,
    });
  } catch (error) {
    console.error("Error in getSinglePastAppointmentDataByPatientId:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
