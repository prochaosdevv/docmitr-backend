import BookingPayment from "../models/bookingPayment.js";


// ✅ Create a new payment
export const createPayment = async (req, res) => {
  try {
    const { appointmentId, txnId, amount } = req.body;

    if (!appointmentId || !txnId || !amount) {
      return res.status(400).json({ message: "appointmentId, txnId and amount are required" });
    }

    const payment = new BookingPayment({ appointmentId, txnId, amount });
    await payment.save();

    res.status(201).json({ message: "Payment created successfully", payment });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get all payments for a specific appointment
export const getPaymentsByAppointmentId = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const payments = await BookingPayment.find({ appointmentId }).populate("appointmentId");

    if (!payments.length) {
      return res.status(404).json({ message: "No payments found for this appointment" });
    }

    res.status(200).json({ appointmentId, payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPaymentByAppointmentId = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Find a single payment for the appointment
   const payment = await BookingPayment.findOne({ appointmentId })
      .populate({
        path: "appointmentId",
        populate: [
            { path: "doctorId", model: "Doctor", select: "_id firstName lastName" },
          { path: "clinicId", model: "Clinic", select: "_id name contact" },
        ],
      });

    if (!payment) {
      return res.status(404).json({ message: "No payment found for this appointment" });
    }

    res.status(200).json({ appointmentId, payment });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

