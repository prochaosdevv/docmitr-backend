import moment from "moment";
import Doctor from "../models/Doctor.js";
import SingleSlot from "../models/SingleSlot.js";
import SlotsAvailability from "../models/SlotsAvailability.js";
import mongoose from "mongoose";

export const getSlotTimes = async (req, res) => {
  try {
    const { clinicId, room, date, time, doctorId: bodyDoctorId } = req.body;

    const doctorId = bodyDoctorId || req.user?.id;

    if (!doctorId || !clinicId || !room || !date || !time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Cast to ObjectId
    const doctorObjectId = new mongoose.Types.ObjectId(doctorId.toString());
    const clinicObjectId = new mongoose.Types.ObjectId(clinicId.toString());

    // Step 1: Find SlotAvailability for the given doctor/clinic/date/time
    const slotConfig = await SlotsAvailability.findOne({
      doctorId: doctorObjectId,
      clinicId: clinicObjectId,
      room,
      date,
      time,
    });

    // Step 2: If no availability config found, return empty array
    if (!slotConfig) {
      return res.status(200).json([]);
    }

    const { startTIme, endTime } = slotConfig.adjustTiming;

    // Parse start and end time from slotConfig (24-hour format)
    const rangeStart = moment(startTIme, "HH:mm");
    const rangeEnd = moment(endTime, "HH:mm");

    // Step 3: Filter SingleSlots that fall within the start and end time
    const allSlots = await SingleSlot.find({});

    const filteredSlots = allSlots.filter((slot) => {
      const [from, to] = slot.slotTimes.split(" - ");
      const slotStart = moment(from.trim(), "hh:mm A");
      const slotEnd = moment(to.trim(), "hh:mm A");

      return (
        slotStart.isSameOrAfter(rangeStart) && slotEnd.isSameOrBefore(rangeEnd)
      );
    });

    return res.status(200).json(filteredSlots);
  } catch (error) {
    console.error("Error in getSlotTimes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// export const createSlotAvailability = async (req, res) => {
//   try {
//     // Ensure the doctorId is coming from the authenticated user (usually using middleware)
//     const doctorId = req.user.id;

//     // Destructure the necessary data from the request body
//     const { slotId, days } = req.body;

//     // Validate the incoming data
//     if (!slotId || !days) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // Create a new SlotAvailability document
//     const newSlotAvailability = new SlotsAvailability({
//       doctorId, // Doctor ID (from authenticated user)
//       slotId, // Slot ID (from frontend select)
//       days, // Selected days (Mon, Tue, etc.)
//     });

//     // Save the document to the database
//     await newSlotAvailability.save();

//     return res.status(201).json({
//       success: true,
//       message: "Slot availability created successfully",
//       data: newSlotAvailability,
//     });
//   } catch (error) {
//     console.error("Error creating slot availability:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const getDoctorSlots = async (req, res) => {
//   try {
//     const doctorId = req.user.id; // Get the authenticated user's ID

//     console.log("Doctor ID:", doctorId);

//     // Fetch the slots for the authenticated doctor
//     const slots = await SlotsAvailability.find({ doctorId }).lean(); // Convert to plain JavaScript objects

//     return res.status(200).json({
//       success: true,
//       data: slots,
//     });
//   } catch (error) {
//     console.error("Error fetching doctor's slots:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const createSlotAvailability = async (req, res) => {
  try {
    const {
      clinicId,
      room,
      date,
      time,
      adjustTiming, // { timeSegment, startTIme, endTime }
    } = req.body;

    let doctorId = req.user.id;

    if (req.body.doctorId) {
      doctorId = req.body.doctorId;
    }

    if (!doctorId) {
      return res.status(400).json({ message: "Select Doctor !" });
    }

    // Check if a slot already exists for the doctor, clinic, date, time, and room
    const existing = await SlotsAvailability.findOne({
      clinicId,
      room,
      date,
      time,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Slot already exists for this time segment." });
    }

    const newSlot = new SlotsAvailability({
      doctorId,
      clinicId,
      room,
      date,
      time,
      adjustTiming,
    });

    await newSlot.save();

    res
      .status(201)
      .json({ message: "Slot created successfully", slot: newSlot });
  } catch (error) {
    console.error("Error creating slot:", error);
    res.status(500).json({ message: "Server error" });
  }
};
