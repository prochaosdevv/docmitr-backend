import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import { connectDb } from "./db/connection.js";

import { authenticateToken } from "./middleware/auth.js";

import { authRoutes } from "./routes/auth.js";
import { patientRoutes } from "./routes/patients.js";
import { doctorRoutes } from "./routes/doctors.js";
import { appointmentRoutes } from "./routes/appointments.js";
import { staffRoutes } from "./routes/staff.js";
import { medicalRecordRoutes } from "./routes/medical-records.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { slotsRoutes } from "./routes/slots.js";
import { clinicRoutes } from "./routes/clinic.js";
import { templateRoutes } from "./routes/prescriptions.js";
import { drugsRouter } from "./routes/drug.js";
import { headoutRouter } from "./routes/headouts.js";
import { smsRouter } from "./routes/sms.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

connectDb();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/docmitr/api/auth", authRoutes);
app.use("/docmitr/api/patients", authenticateToken, patientRoutes);
app.use("/docmitr/api/doctors", authenticateToken, doctorRoutes);
app.use("/docmitr/api/appointments", authenticateToken, appointmentRoutes);
app.use("/docmitr/api/staff", authenticateToken, staffRoutes);
app.use("/docmitr/api/medical-records", authenticateToken, medicalRecordRoutes);
app.use("/docmitr/api/dashboard", authenticateToken, dashboardRoutes);
app.use("/docmitr/api/slots", slotsRoutes);
app.use("/docmitr/api/clinics", clinicRoutes);
app.use("/docmitr/api/templates", templateRoutes);
app.use("/docmitr/api/drugs", drugsRouter);
app.use("/docmitr/api/headouts", headoutRouter);
app.use("/docmitr/api/sms", smsRouter);

// Root route
app.get("/", (req, res) => {
  res.send("Clinic Management API is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
