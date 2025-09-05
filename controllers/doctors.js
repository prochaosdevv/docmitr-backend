import { db, findById, findAll, create, update, remove } from "../db/index.js";
import { welcomeEmail } from "../emails.js";
import Doctor from "../models/Doctor.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/send-mail.js";
import { generateInvoice } from "../utils/invoice.js";
import { formidable } from "formidable";
import fs from "fs";
import AWS from "aws-sdk";

const s3Client = new AWS.S3({
  secretAccessKey: process.env.ACCESS_KEY,
  accessKeyId: process.env.ACCESS_ID,
  region: process.env.region,
});

export const getDoctors = async (req, res) => {
  try {
    const result = await Doctor.find({})
      .select(
        "firstName lastName specialization subscription address city state zipCode active"
      )
      .populate("subscription", "planName price startDate endDate createdAt")
      .lean();
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTotalDoctorsCount = async (req, res) => {
  try {
    // Total doctors
    const totalCount = await Doctor.countDocuments();

    // Get start and end of last month
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Doctors added in the last month
    const lastMonthCount = await Doctor.countDocuments({
      createdAt: {
        $gte: startOfLastMonth,
        $lt: startOfThisMonth,
      },
    });

    // find recent doctors added and sort by latest
    const recentDoctors = await Doctor.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      totalCount,
      lastMonthCount,
      recentDoctors,
    });
  } catch (error) {
    console.error("Error fetching doctor stats:", error);
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
export const getDoctorByIdForUsers = async (req, res) => {
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
    const doctor = await Doctor.findById(doctorId)
      .lean()
      .populate("subscription", "planName price")
      .select("-password");

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

export const getDoctorsExceptLoggedIn = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const doctors = await Doctor.find({ _id: { $ne: doctorId } })
      .select(
        "firstName lastName specialization subscriptionType address city state zipCode active"
      )
      .lean();

    res.status(200).json({
      data: doctors,
    });
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
      regNo,
      subscription,
      subscriptionDuration,
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

    // set subscription end date based on duration
    let subscriptionEndDate = null;

    if (subscriptionDuration) {
      const durationInMonths = parseInt(subscriptionDuration, 10);
      if (isNaN(durationInMonths) || durationInMonths <= 0) {
        return res
          .status(400)
          .json({ message: "Invalid subscription duration" });
      }

      const now = new Date();
      const end = new Date(now);

      // Set day to 1 temporarily to prevent rollover issues
      end.setDate(1);
      end.setMonth(end.getMonth() + durationInMonths);

      // Now restore day to original (or last day of new month if original day is too big)
      const originalDay = now.getDate();
      const daysInTargetMonth = new Date(
        end.getFullYear(),
        end.getMonth() + 1,
        0
      ).getDate();
      end.setDate(Math.min(originalDay, daysInTargetMonth));

      subscriptionEndDate = end;
    }

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
      regNo,
      subscription,
      subscriptionEndDate,
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

    // generate a invoice

    try {
      await generateInvoice({
        doctorId: newDoctor._id,
        subscription, // passed from request
        duration: subscriptionEndDate, // passed from request
      });
    } catch (err) {
      console.error("Failed to generate invoice:", err.message);
    }

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
      regNo,
      subscription,
      subscriptionDuration,
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

    // set subscription end date based on duration
    let subscriptionEndDate = null;

    if (subscriptionDuration) {
      const durationInMonths = parseInt(subscriptionDuration, 10);
      if (isNaN(durationInMonths) || durationInMonths <= 0) {
        return res
          .status(400)
          .json({ message: "Invalid subscription duration" });
      }

      const now = new Date();
      const end = new Date(now);

      // Set day to 1 temporarily to prevent rollover issues
      end.setDate(1);
      end.setMonth(end.getMonth() + durationInMonths);

      // Now restore day to original (or last day of new month if original day is too big)
      const originalDay = now.getDate();
      const daysInTargetMonth = new Date(
        end.getFullYear(),
        end.getMonth() + 1,
        0
      ).getDate();
      end.setDate(Math.min(originalDay, daysInTargetMonth));

      subscriptionEndDate = end;
    }

    // Update only allowed fields (not password)
    doctor.firstName = firstName || doctor.firstName;
    doctor.lastName = lastName || doctor.lastName;
    doctor.specialization = specialization || doctor.specialization;
    doctor.email = email || doctor.email;
    doctor.phone = phone || doctor.phone;
    doctor.bio = bio || doctor.bio;
    doctor.consultationFee = consultationFee || doctor.consultationFee;
    doctor.regNo = regNo || doctor.regNo;
    doctor.subscription = subscription || doctor.subscription;
    doctor.subscriptionEndDate =
      subscriptionEndDate || doctor.subscriptionEndDate;
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

export const updateDoctorProfileImage = async (req, res) => {
  try {
    const form = formidable({
      maxFileSize: 1 * 1024 * 1024 * 1024, // 1 GB
      multiples: false,
    });

    let filePath,
      fileName,
      fileType,
      fields = {};

    form.parse(req);

    form.on("field", (name, value) => {
      fields[name] = value;
    });

    form.on("file", (name, file) => {
      if (["image", "file", "attachment"].includes(name)) {
        filePath = file.filepath || file.path;
        fileName = file.originalFilename || file.newFilename;
        fileType = file.mimetype || "application/octet-stream";
      }
    });

    form.on("end", async () => {
      if (!filePath) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      try {
        const buffer = fs.readFileSync(filePath);
        const extension = fileName.split(".").pop().toLowerCase();
        const s3Key = `doctor-profile-image/${Date.now()}_${fileName}`;

        const upload = await s3Client
          .upload({
            Bucket: process.env.IMAGE_BUCKET,
            Key: s3Key,
            Body: buffer,
            ContentType: fileType,
          })
          .promise();

        const doctorId = req.user.id;

        let type = "document";
        if (fileType.startsWith("image/")) type = "image";

        // Try to find existing attachment entry for same day
        let existing = await Doctor.findById(doctorId);

        if (!existing) {
          return res.status(404).json({ error: "Doctor not found" });
        }

        // Update the doctor's profile image
        existing.profileImage = upload.Location;

        await existing.save();

        res.status(201).json({
          success: true,
          message: "Profile image updated successfully",
          doctor: existing,
        });
      } catch (err) {
        console.error("Upload Error:", err);
        res
          .status(500)
          .json({ error: "Attachment creation failed: " + err.message });
      }
    });

    form.on("error", (err) => {
      console.error("Formidable Error:", err);
      return res.status(500).json({ error: "Error parsing form data" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateDoctorDetails = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const updates = req.body;

    // Find the doctor by ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Update the doctor's details
    Object.keys(updates).forEach((key) => {
      if (doctor[key] !== undefined) {
        doctor[key] = updates[key];
      }
    });

    // Save the updated doctor
    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Doctor details updated successfully",
      doctor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
