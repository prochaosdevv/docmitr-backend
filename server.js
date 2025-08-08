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
import { vitalsRouter } from "./routes/vitals.js";
import { consultantFollowups } from "./routes/consultantFollowups.js";
import { historyTemplatesRoutes } from "./routes/medicalHistroy.js";
import { labTestsRoute } from "./routes/labtests.js";
import { attachmentRoute } from "./routes/attachment.js";
import { doctorReferenceRoutes } from "./routes/doctorReference.js";
import { prescriptionTemplateRoutes } from "./routes/prescriptionRoutes.js";
import { otherReferenceRoutes } from "./routes/otherReferences.js";
import { labRouter } from "./routes/lab.js";
import { subscriptionRoutes } from "./routes/subscription.js";
import { invoiceRoutes } from "./routes/invoice.js";
import { adminSettingsRoutes } from "./routes/adminSettings.js";
import { paymentRoutes } from "./routes/payment.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

connectDb();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/test", (req, res) => {
  res.send("Test route is working");
});

// Routes
app.use("/docmitr/api/auth", authRoutes);
app.use("/docmitr/api/patients", authenticateToken, patientRoutes);
app.use("/docmitr/api/doctors", authenticateToken, doctorRoutes);
app.use("/docmitr/api/appointments", authenticateToken, appointmentRoutes);
app.use("/docmitr/api/staffs", staffRoutes);
app.use("/docmitr/api/medical-records", authenticateToken, medicalRecordRoutes);
app.use("/docmitr/api/dashboard", authenticateToken, dashboardRoutes);
app.use("/docmitr/api/slots", slotsRoutes);
app.use("/docmitr/api/clinics", authenticateToken, clinicRoutes);
app.use("/docmitr/api/vitals", authenticateToken, vitalsRouter);
app.use(
  "/docmitr/api/cosultant-followup",
  authenticateToken,
  consultantFollowups
);
app.use(
  "/docmitr/api/medical-history",
  authenticateToken,
  historyTemplatesRoutes
);
app.use("/docmitr/api/attachments", authenticateToken, attachmentRoute);
app.use("/docmitr/api/labtests", authenticateToken, labTestsRoute);
app.use(
  "/docmitr/api/prescriptions",
  authenticateToken,
  prescriptionTemplateRoutes
);
app.use("/docmitr/api/templates", templateRoutes);
app.use("/docmitr/api/drugs", drugsRouter);
app.use("/docmitr/api/headouts", headoutRouter);
app.use("/docmitr/api/sms", smsRouter);
app.use("/docmitr/api/invoices", invoiceRoutes);
app.use("/docmitr/api/labs", labRouter);
app.use("/docmitr/api/reference", doctorReferenceRoutes);
app.use("/docmitr/api/reference/other", otherReferenceRoutes);
app.use("/docmitr/api/subscriptions", authenticateToken, subscriptionRoutes);
app.use("/docmitr/api/settings", authenticateToken, adminSettingsRoutes);
app.use("/docmitr/api/payments", paymentRoutes);

// Root route
app.get("/docmitr", (req, res) => {
  res.send("Clinic Management API is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
