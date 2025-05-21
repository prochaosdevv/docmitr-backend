import { db, findById, findAll, create, update, remove } from "../db/index.js";
import Appoinment from "../models/Appoinment.js";
import Patient from "../models/Patient.js";
import PatientAddressHistory from "../models/PatientAddressHistory.js";

export const getPatientsByQuery = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return await getPatients(req, res);
    }

    // Create a case-insensitive partial match regex
    const regex = new RegExp(search, "i");

    // Search across name, email, and phone
    const patients = await Patient.find({
      $or: [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
        { phone: { $regex: regex } },
      ],
    })
      .select(
        "name email phone patientId patientUID caretakerName thirdPartyUID ageMonths ageYears gender clinicSpecificId bloodGroup dobYear dobMonth dobDate address1 address2 area pincode city district state country _id"
      )
      .limit(10);

    return res.status(200).json({
      success: true,
      data: patients,
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPatientById = (req, res) => {
  try {
    const patient = findById("patients", req.params.id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createPatient = async (req, res) => {
  try {
    // Get latest patientId and generate new one
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
    const existingPatient = await Patient.findOne({ patientId: nextPatientId });

    const existingPatientEmail = await Patient.findOne({
      email: req.body.email,
    });

    if (existingPatient || existingPatientEmail) {
      return res
        .status(400)
        .json({ message: "Duplicate patient detected. Try again." });
    }

    const newPatient = new Patient({
      patientId: nextPatientId,
      clinicSpecificId: req.body.clinicSpecificId || null,
      language: req.body.language || null,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
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
    });

    await newPatient.save();

    return res.status(201).json({
      message: "Patient created successfully",
      data: newPatient,
    });
  } catch (error) {
    console.error("Create patient error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      uid,
      name,
      gender,
      dateOfBirth,
      caretakerName,
      email,
      bloodGroup,
      mobile,
      thirdPartyUid,
      comments,
      address,
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    const patient = await Patient.findOne({ patientId: id });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Prevent duplicate email (if changed and not blank)
    if (email && email !== patient.email) {
      const emailExists = await Patient.findOne({ email });
      if (emailExists) {
        return res
          .status(400)
          .json({ message: "Email already used by another patient" });
      }
    }

    // Map UI fields to schema fields
    const updateFields = {
      patientUID: uid || null,
      thirdPartyUID: thirdPartyUid || null,
      name,
      gender,
      email: email || "",
      caretakerName: caretakerName || null,
      bloodGroup: bloodGroup || "",
      phone: mobile,
      address1: address?.addressLine1 || "",
      address2: address?.addressLine2 || "",
      area: address?.area || "",
      pincode: address?.pincode || "",
      city: address?.city || "",
      district: address?.district || "",
      state: address?.state || "",
      country: address?.country || "India",
    };

    // If dateOfBirth provided, split into year, month, date
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      updateFields.dobYear = dob.getFullYear().toString();
      updateFields.dobMonth = dob.getMonth().toString(); // 0-indexed
      updateFields.dobDate = dob.getDate().toString();
    }

    const updatedPatient = await Patient.findOneAndUpdate(
      { patientId: id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Patient updated successfully",
      data: updatedPatient,
    });
  } catch (error) {
    console.error("Update patient error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const deletedPatient = await Patient.findOneAndDelete({
      patientId: req.params.id,
    });

    if (!deletedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPatientAppointments = (req, res) => {
  try {
    const patientId = req.params.id;
    const appointments = db.appointments.filter(
      (a) => a.patientId === patientId
    );

    // Enrich with doctor information
    const enrichedAppointments = appointments.map((appointment) => {
      const doctor = findById("doctors", appointment.doctorId);
      return {
        ...appointment,
        doctor: doctor
          ? {
              id: doctor.id,
              name: `${doctor.firstName} ${doctor.lastName}`,
              specialization: doctor.specialization,
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

export const getPatientMedicalRecords = (req, res) => {
  try {
    const patientId = req.params.id;
    const records = db.medicalRecords.filter((r) => r.patientId === patientId);

    // Enrich with doctor information
    const enrichedRecords = records.map((record) => {
      const doctor = findById("doctors", record.doctorId);
      return {
        ...record,
        doctor: doctor
          ? {
              id: doctor.id,
              name: `${doctor.firstName} ${doctor.lastName}`,
              specialization: doctor.specialization,
            }
          : null,
      };
    });

    res.json({
      data: enrichedRecords,
      pagination: {
        total: enrichedRecords.length,
        page: 1,
        limit: enrichedRecords.length,
        pages: 1,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPatientVitals = (req, res) => {
  try {
    const patientId = req.params.id;
    const vitals = db.vitals.filter((v) => v.patientId === patientId);

    res.json({
      data: vitals,
      pagination: {
        total: vitals.length,
        page: 1,
        limit: vitals.length,
        pages: 1,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .select(
        "name email phone patientId patientUID caretakerName thirdPartyUID ageMonths ageYears gender clinicSpecificId bloodGroup dobYear dobMonth dobDate address1 address2 area pincode city district state country _id"
      )
      .sort({ createdAt: -1 })
      .limit(10);

    if (!patients) {
      return res.status(404).json({ message: "No patients found" });
    }

    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePatientAddressAndCreateHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      addressLine1,
      addressLine2,
      area,
      pincode,
      city,
      district,
      state,
      country,
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    const patient = await Patient.findOne({ _id: id.toString() });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    await PatientAddressHistory.create({
      patientId: id,
      address1: patient.address1,
      address2: patient.address2 || "",
      area: patient.area || "",
      pincode: patient.pincode || "",
      city: patient.city || "",
      district: patient.district || "",
      state: patient.state || "",
      country: patient.country || "India",
    });

    await Patient.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          address1: addressLine1 || "",
          address2: addressLine2 || "",
          area: area || "",
          pincode: pincode || "",
          city: city || "",
          district: district || "",
          state: state || "",
          country: country || "India",
        },
      },
      { new: true, runValidators: true }
    );

    await Appoinment.findOneAndUpdate(
      { patientId: id },
      {
        $set: {
          address: {
            addressLine1,
            addressLine2,
            city,
            state,
            district,
            country,
            pincode,
            area,
          },
        },
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Patient updated successfully",
    });
  } catch (error) {
    console.error("Update patient error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
