import express from "express";
import {
  getDoctorById,
  getDoctorByIdForUsers,
} from "../controllers/doctors.js";
import { getClinicsByDoctorIdForUsers, getClinicsByDoctorOrStaffId } from "../controllers/clinic.js";
import { getSlotsByDayForUsers } from "../controllers/slots.js";
import { createPayment, getPaymentByAppointmentId, getPaymentsByAppointmentId } from "../controllers/bookingPaymentController.js";
import { createUserAppointment } from "../controllers/appointments.js";


const router = express.Router();

router.get("/get/doctor/:id", getDoctorByIdForUsers);
router.get("/get/clinics/doctor/:userId", getClinicsByDoctorIdForUsers);
router.get("/get/slots/:clinicId", getSlotsByDayForUsers);
router.post("/create/appointment", createUserAppointment);
router.post("/create/payment", createPayment);
router.get("/get/all/payment/:appointmentId", getPaymentsByAppointmentId);
router.get("/get/appointment/:appointmentId", getPaymentByAppointmentId);


export const userRoutes = router;
