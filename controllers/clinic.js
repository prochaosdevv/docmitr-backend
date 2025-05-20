import moment from "moment";
import Clinic from "../models/Clinic.js";
import {
  extractInvoiceSettings,
  extractInvoicePrintSettings,
  extractContact,
  extractClinicTimings,
} from "../utils/helper-functions.js";
import Doctor from "../models/Doctor.js";
import Staff from "../models/Staff.js";

export const createClinic = async (req, res) => {
  try {
    const {
      name,
      contactNo1,
      contactNo2,
      email,
      gstNumber,
      drugLicenseNumber,
      foodLicenseNumber,
      logoUrl,
      enableOnSearch,
      sharePrescriptionAcrossClinic,
      sharePrescriptionAcrossOtherClinics,
      shareDrugsAcrossClinic,
      showLastVisitAcrossClinicDoctors,
      invoiceSettings,
      invoicePrintSettings,
      invoiceFooter,
      prescriptionFooter,
      parallelRooms,
      onlineAppointmentPayment,
      offlineAppointmentPayment,
      contact,
      clinicTimings,
    } = req.body;

    const doctorId = req.user.id;

    const newClinic = new Clinic({
      name,
      doctorId,
      contactNo1,
      contactNo2,
      email,
      gstNumber,
      drugLicenseNumber,
      foodLicenseNumber,
      logoUrl,
      enableOnSearch,
      sharePrescriptionAcrossClinic,
      sharePrescriptionAcrossOtherClinics,
      shareDrugsAcrossClinic,
      showLastVisitAcrossClinicDoctors,
      invoiceSettings: extractInvoiceSettings(invoiceSettings),
      invoicePrintSettings: extractInvoicePrintSettings(invoicePrintSettings),
      invoiceFooter,
      prescriptionFooter,
      parallelRooms,
      onlineAppointmentPayment,
      offlineAppointmentPayment,
      contact: extractContact(contact),
      clinicTimings: extractClinicTimings(clinicTimings),
    });

    const doc = await Doctor.findById(doctorId);
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    doc.profileCompleted = true;
    await doc.save();
    const savedClinic = await newClinic.save();

    res.status(201).json({
      success: true,
      message: "Clinic created successfully",
      data: savedClinic,
    });
  } catch (error) {
    console.error("Clinic creation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getClinicsByDoctorOrStaffId = async (req, res) => {
  const userId = req.params.userId; // doctor or staff ID
  const userRole = req.user.role; // user role from JWT

  try {
    let clinics;

    if (userRole === "doctor") {
      // Find clinics where doctorId matches
      clinics = await Clinic.find({ doctorId: userId }).populate("doctorId", [
        "firstName",
        "lastName",
        "specialization",
        "email",
        "phone",
      ]);
    } else if (userRole === "staff") {
      const staff = await Staff.findById(userId);
      if (!staff) {
        return res
          .status(404)
          .json({ success: false, message: "Staff not found" });
      }

      // Fetch the single clinic by the staff's clinic field
      const clinic = await Clinic.findById(staff.clinic).populate("doctorId", [
        "firstName",
        "lastName",
        "specialization",
        "email",
        "phone",
      ]);

      clinics = clinic ? [clinic] : [];
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized role" });
    }

    if (!clinics || clinics.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No clinics found" });
    }

    res.status(200).json({ success: true, clinics });
  } catch (error) {
    console.error("Error fetching clinics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getClinic = async (req, res) => {
  try {
    const clinics = await Clinic.find();

    const clinicsWithDummyDoctors = clinics.map((clinic) => ({
      id: clinic._id,
      name: clinic.name,
      status: "complete", // assuming all are complete; can be computed
      visibleOnSearch: true, // can be tied to a flag later
      landline: clinic.contactNo1 || "N/A",
      address: `${clinic.contact?.address}, ${clinic.contact?.area}, ${clinic.contact?.city}, ${clinic.contact?.state}, ${clinic.contact?.country} - ${clinic.contact?.pincode}`,
      primaryDoctor: {
        name: "Dr. Amit Miglani",
        specialization: "Gastroenterologist",
        phone: "9891510101",
      },
      associatedDoctors: [
        {
          id: "assoc1",
          name: "Dr. Sneha Verma",
          specialization: "Cardiologist",
          phone: "9876543210",
        },
      ],
      panelDoctors: [
        {
          id: "panel1",
          name: "Dr. Rajesh Sharma",
          specialization: "Dermatologist",
          phone: "9123456780",
        },
      ],
    }));

    return res
      .status(200)
      .json({ success: true, clinics: clinicsWithDummyDoctors });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateClinic = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const clinic = await Clinic.findById(id);
    if (!clinic) {
      return res
        .status(404)
        .json({ success: false, message: "Clinic not found" });
    }

    // Deep merge logic
    const deepMerge = (target, source) => {
      for (const key in source) {
        if (
          source[key] &&
          typeof source[key] === "object" &&
          !Array.isArray(source[key])
        ) {
          target[key] = deepMerge(target[key] || {}, source[key]);
        } else {
          target[key] = source[key];
        }
      }
      return target;
    };

    // Perform deep merge for each relevant object field
    const mergeFields = [
      "contact",
      "clinicTimings",
      "invoiceSettings",
      "invoicePrintSettings",
      "parallelRooms",
      "onlineAppointmentPayment",
      "offlineAppointmentPayment",
    ];

    for (const field of mergeFields) {
      if (updates[field]) {
        clinic[field] = deepMerge(clinic[field] || {}, updates[field]);
        delete updates[field]; // prevent overwrite by shallow assignment below
      }
    }

    // Assign remaining top-level fields directly (like name, contactNo1, etc.)
    Object.assign(clinic, updates);

    await clinic.save();
    res.json({ success: true, message: "Clinic updated successfully", clinic });
  } catch (error) {
    console.error("Error updating clinic:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteClinic = async (req, res) => {
  const { id } = req.params;

  try {
    const clinic = await Clinic.findByIdAndDelete(id);
    if (!clinic) {
      return res
        .status(404)
        .json({ success: false, message: "Clinic not found" });
    }

    res.json({ success: true, message: "Clinic deleted successfully" });
  } catch (error) {
    console.error("Error deleting clinic:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getTotalClinics = async (req, res) => {
  try {
    const totalClinics = await Clinic.countDocuments();

    const endOfLastMonth = moment()
      .subtract(1, "month")
      .endOf("month")
      .toDate();

    const lastMonthTotal = await Clinic.countDocuments({
      createdAt: { $lte: endOfLastMonth },
    });

    const increment = totalClinics - lastMonthTotal;

    res.status(200).json({
      success: true,
      totalClinics,
      increment,
    });
  } catch (error) {
    console.error("Error fetching total clinics:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
