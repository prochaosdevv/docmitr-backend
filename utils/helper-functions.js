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

function to24Hour(hour, minute, period) {
  hour = parseInt(hour);
  minute = parseInt(minute);

  if (period.toLowerCase() === "pm" && hour !== 12) hour += 12;
  if (period.toLowerCase() === "am" && hour === 12) hour = 0;

  return { hour, minute };
}

function formatTime(hour, minute) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function generateSlotsForDay(schedule, sessionKey, slotDuration) {
  const slots = [];

  const session = schedule[sessionKey];
  if (!session?.enabled) return slots;

  const { hour: startH, minute: startM } = to24Hour(
    session.startHour,
    session.startMinute,
    session.startPeriod
  );
  const { hour: endH, minute: endM } = to24Hour(
    session.endHour,
    session.endMinute,
    session.endPeriod
  );

  const start = new Date();
  start.setHours(startH, startM, 0, 0);
  const end = new Date();
  end.setHours(endH, endM, 0, 0);

  while (start < end) {
    const next = new Date(start.getTime() + slotDuration * 60000);
    if (next > end) break;

    const slotStart = formatTime(start.getHours(), start.getMinutes());
    const slotEnd = formatTime(next.getHours(), next.getMinutes());

    slots.push(`${slotStart} - ${slotEnd}`);
    start.setTime(next.getTime());
  }

  return slots;
}

export const isAddressComplete = (address) => {
  return (
    address &&
    address.addressLine1 &&
    address.city &&
    address.state &&
    address.district &&
    address.country &&
    address.pincode &&
    address.area
  );
};

export const parseDateTimeString = (dateTimeStr) => {
  return new Date(dateTimeStr);
};
