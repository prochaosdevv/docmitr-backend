// utils/clinicHelpers.js

export const extractInvoiceSettings = (settings = {}) => ({
  showSignatureAndName: settings.showSignatureAndName || false,
  showClinicNameInSignature: settings.showClinicNameInSignature || false,
  showDoctorInCharge: settings.showDoctorInCharge || false,
  showPatientAddress: settings.showPatientAddress || false,
  showMrpBatchExpiry: settings.showMrpBatchExpiry || false,
  allowZeroAmountInvoices: settings.allowZeroAmountInvoices || false,
});

export const extractInvoicePrintSettings = (settings = {}) => ({
  headerHeight: settings.headerHeight || "",
  footerHeight: settings.footerHeight || "",
  leftMargin: settings.leftMargin || "",
  rightMargin: settings.rightMargin || "",
  pageSize: settings.pageSize || "A4",
  pageOrientation: settings.pageOrientation || "Portrait",
});

export const extractContact = (contact = {}) => ({
  address: contact.address || "",
  area: contact.area || "",
  pincode: contact.pincode || "",
  city: contact.city || "Mumbai",
  state: contact.state || "Maharashtra",
  country: contact.country || "India",
});

export const extractClinicTimings = (timings = {}) => ({
  appointmentTimeSlot: timings.appointmentTimeSlot || "5",
  blockConfirmedAppointments: timings.blockConfirmedAppointments || false,
  registerPatientOnLivehealth: timings.registerPatientOnLivehealth || false,
  morningEnabled: timings.morningEnabled || false,
  morningHour: timings.morningHour || "",
  morningMinute: timings.morningMinute || "",
  morningPeriod: timings.morningPeriod || "AM",
  eveningEnabled: timings.eveningEnabled || false,
  eveningHour: timings.eveningHour || "",
  eveningMinute: timings.eveningMinute || "",
  eveningPeriod: timings.eveningPeriod || "PM",
  weeklySchedule: timings.weeklySchedule || {},
});
