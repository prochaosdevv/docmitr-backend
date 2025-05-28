import mongoose from "mongoose";

const WeeklySlotSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    startHour: { type: String, default: null },
    startMinute: { type: String, default: null },
    startPeriod: { type: String, default: null },
    endHour: { type: String, default: null },
    endMinute: { type: String, default: null },
    endPeriod: { type: String, default: null },
  },
  { _id: false }
);

const ClinicAppointmentSummarySchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    patientName: { type: String },
    email: { type: String },
    mobileNumber: { type: String },
  },
  { _id: false }
);

const DayScheduleSchema = new mongoose.Schema(
  {
    morning: { type: WeeklySlotSchema, default: () => ({}) },
    evening: { type: WeeklySlotSchema, default: () => ({}) },
  },
  { _id: false }
);

const ClinicTimingsSchema = new mongoose.Schema(
  {
    appointmentTimeSlot: { type: String, default: null },
    blockConfirmedAppointments: { type: Boolean, default: false },
    registerPatientOnLivehealth: { type: Boolean, default: false },
    morningEnabled: { type: Boolean, default: false },
    morningHour: { type: String, default: null },
    morningMinute: { type: String, default: null },
    morningPeriod: { type: String, default: null },
    eveningEnabled: { type: Boolean, default: false },
    eveningHour: { type: String, default: null },
    eveningMinute: { type: String, default: null },
    eveningPeriod: { type: String, default: null },
    weeklySchedule: {
      monday: { type: DayScheduleSchema, default: () => ({}) },
      tuesday: { type: DayScheduleSchema, default: () => ({}) },
      wednesday: { type: DayScheduleSchema, default: () => ({}) },
      thursday: { type: DayScheduleSchema, default: () => ({}) },
      friday: { type: DayScheduleSchema, default: () => ({}) },
      saturday: { type: DayScheduleSchema, default: () => ({}) },
      sunday: { type: DayScheduleSchema, default: () => ({}) },
    },
  },
  { _id: false }
);

const InvoiceSettingsSchema = new mongoose.Schema(
  {
    showSignatureAndName: { type: Boolean, default: false },
    showClinicNameInSignature: { type: Boolean, default: false },
    showDoctorInCharge: { type: Boolean, default: false },
    showPatientAddress: { type: Boolean, default: false },
    showMrpBatchExpiry: { type: Boolean, default: false },
    allowZeroAmountInvoices: { type: Boolean, default: false },
  },
  { _id: false }
);

const InvoicePrintSettingsSchema = new mongoose.Schema(
  {
    headerHeight: { type: String, default: null },
    footerHeight: { type: String, default: null },
    leftMargin: { type: String, default: null },
    rightMargin: { type: String, default: null },
    pageSize: { type: String, default: "A4" },
    pageOrientation: { type: String, default: "Portrait" },
  },
  { _id: false }
);

const ContactSchema = new mongoose.Schema(
  {
    address: { type: String, default: null },
    area: { type: String, default: null },
    pincode: { type: String, default: null },
    city: { type: String, default: "Mumbai" },
    state: { type: String, default: "Maharashtra" },
    country: { type: String, default: "India" },
  },
  { _id: false }
);

const ParallelRoomsSchema = new mongoose.Schema(
  {
    numberOfRooms: { type: String, default: "1" },
  },
  { _id: false }
);

const OnlineAppointmentPaymentSchema = new mongoose.Schema(
  {
    minimumAmount: { type: String, default: null },
    payNow: { type: Boolean, default: false },
    payAtClinic: { type: Boolean, default: false },
  },
  { _id: false }
);

const OfflineAppointmentPaymentSchema = new mongoose.Schema(
  {
    firstVisitCharges: { type: String, default: null },
    followUpVisitCharges: { type: String, default: null },
    followupValidityInDays: { type: String, default: null },
    subsequentVisitCharges: { type: String, default: null },
  },
  { _id: false }
);

const clinicSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    name: { type: String, default: null, required: true },
    contactNo1: { type: String, default: null },
    contactNo2: { type: String, default: null },
    email: { type: String, default: null },
    gstNumber: { type: String, default: null },
    drugLicenseNumber: { type: String, default: null },
    foodLicenseNumber: { type: String, default: null },
    logoUrl: { type: String, default: null },

    enableOnSearch: { type: Boolean, default: true },
    sharePrescriptionAcrossClinic: { type: Boolean, default: false },
    sharePrescriptionAcrossOtherClinics: { type: Boolean, default: true },
    shareDrugsAcrossClinic: { type: Boolean, default: false },
    showLastVisitAcrossClinicDoctors: { type: Boolean, default: false },

    invoiceSettings: { type: InvoiceSettingsSchema, default: () => ({}) },
    invoicePrintSettings: {
      type: InvoicePrintSettingsSchema,
      default: () => ({}),
    },

    invoiceFooter: { type: String, default: null },
    prescriptionFooter: { type: String, default: null },

    parallelRooms: { type: ParallelRoomsSchema, default: () => ({}) },

    onlineAppointmentPayment: {
      type: OnlineAppointmentPaymentSchema,
      default: () => ({}),
    },
    offlineAppointmentPayment: {
      type: OfflineAppointmentPaymentSchema,
      default: () => ({}),
    },

    contact: { type: ContactSchema, default: () => ({}) },

    clinicTimings: { type: ClinicTimingsSchema, default: () => ({}) },

    // appointments: { type: [ClinicAppointmentSummarySchema], default: [] },

    clinicStatus: {
      type: String,
      enum: ["complete", "incomplete"],
      default: "complete",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Clinic", clinicSchema);
