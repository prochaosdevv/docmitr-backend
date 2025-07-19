import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import Mongoose models
import User from "./models/User.js";
import Doctor from "./models/Doctor.js";
import Patient from "./models/Patient.js";
import Appointment from "./models/Appoinment.js";
import Staff from "./models/Staff.js";
import MedicalRecord from "./models/MedicalRecord.js";
// import Vital from "./models/Vital.js";
import SingleSlot from "./models/SingleSlot.js";
import SMS from "./models/SMS.js";
import Allergies from "./models/Allergy.js";

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URI);
console.log("Connected to MongoDB");

const generateTimeSlots = (start, end, interval) => {
  const slots = [];
  let current = new Date(`1970-01-01T${start}:00`);
  const endTime = new Date(`1970-01-01T${end}:00`);

  while (current < endTime) {
    const next = new Date(current.getTime() + interval * 60000);
    const formatTime = (d) =>
      d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

    slots.push({
      slotTimes: `${formatTime(current)} - ${formatTime(next)}`,
    });
    current = next;
  }

  return slots;
};

// Seed users
const seedUsers = async () => {
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const hashedDoctorPassword = await bcrypt.hash("doctor123", 10);

  await User.deleteMany();
  await User.insertMany([
    {
      email: "admin@docmitr.com",
      password: hashedAdminPassword,
      name: "Admin User",
      role: "admin",
    },
    {
      email: "ananya.gupta@docmitr.com",
      password: hashedDoctorPassword,
      name: "Dr. Ananya Gupta",
      role: "doctor",
    },
    {
      email: "mohan.gupta@docmitr.com",
      password: hashedDoctorPassword,
      name: "Dr. Mohan Kumar",
      role: "doctor",
    },
    {
      email: "amit.sharma@docmitr.com",
      password: hashedDoctorPassword,
      name: "Dr. Amit Sharma",
      role: "doctor",
    },
  ]);
};

// Seed doctors
const seedDoctors = async () => {
  await Doctor.deleteMany();
  await Doctor.insertMany([
    {
      firstName: "Ananya",
      lastName: "Gupta",
      email: "ananya.gupta@docmitr.com",
      specialization: "Cardiology",
      phone: "+91 98765 43210",
      address: "123 Medical Lane, Mumbai",
      avatar: "/abstract-geometric-shapes.png",
      bio: "Experienced cardiologist with over 10 years of practice.",
      consultationFee: 1500,
    },
    {
      firstName: "Vikram",
      lastName: "Sharma",
      email: "vikram.sharma@docmitr.com",
      specialization: "Neurology",
      phone: "+91 87654 32109",
      address: "456 Health Street, Delhi",
      avatar: "/abstract-geometric-sr.png",
      bio: "Specialized in neurological disorders and treatments.",
      consultationFee: 1800,
    },
    {
      firstName: "Priya",
      lastName: "Patel",
      email: "priya.patel@docmitr.com",
      specialization: "Pediatrics",
      phone: "+91 76543 21098",
      address: "789 Care Avenue, Bangalore",
      avatar: "/abstract-geometric-MI.png",
      bio: "Dedicated to providing quality healthcare for children.",
      consultationFee: 1200,
    },
  ]);
};

// Seed patients
const seedPatients = async () => {
  await Patient.deleteMany();
  await Patient.insertMany([
    {
      firstName: "Rahul",
      lastName: "Mehta",
      email: "rahul.mehta@example.com",
      phone: "+91 98765 12345",
      address: "123 Patient Street, Chennai",
      dateOfBirth: "1985-05-15",
      gender: "Male",
      bloodGroup: "O+",
      medicalHistory: "Hypertension, Diabetes",
      avatar: "/abstract-rs.png",
    },
    {
      firstName: "Neha",
      lastName: "Singh",
      email: "neha.singh@example.com",
      phone: "+91 87654 23456",
      address: "456 Health Avenue, Kolkata",
      dateOfBirth: "1990-08-22",
      gender: "Female",
      bloodGroup: "A+",
      medicalHistory: "Asthma",
      avatar: "/abstract-geometric-gold.png",
    },
    {
      firstName: "Arjun",
      lastName: "Kumar",
      email: "arjun.kumar@example.com",
      phone: "+91 76543 34567",
      address: "789 Wellness Road, Hyderabad",
      dateOfBirth: "1978-12-10",
      gender: "Male",
      bloodGroup: "B-",
      medicalHistory: "None",
      avatar: "/stylized-initials.png",
    },
    {
      firstName: "Meera",
      lastName: "Reddy",
      email: "meera.reddy@example.com",
      phone: "+91 65432 45678",
      address: "101 Care Lane, Pune",
      dateOfBirth: "1995-03-28",
      gender: "Female",
      bloodGroup: "AB+",
      medicalHistory: "Allergies",
      avatar: "/Abstract-NK.png",
    },
    {
      firstName: "Sanjay",
      lastName: "Joshi",
      email: "sanjay.joshi@example.com",
      phone: "+91 54321 56789",
      address: "202 Health Park, Ahmedabad",
      dateOfBirth: "1982-07-14",
      gender: "Male",
      bloodGroup: "O-",
      medicalHistory: "Heart condition",
      avatar: "/golden-outback.png",
    },
  ]);
};

// Seed other collections similarly
const seedAppointments = async () => {
  await Appointment.deleteMany();
  await Appointment.insertMany([
    {
      patientId: "6811ae73f6c7abffccdf0daf",
      doctorId: "6811ae73f6c7abffccdf0daa",
      date: "2023-11-15",
      time: "10:00",
      status: "completed",
      reason: "Regular checkup",
      notes:
        "Patient reported feeling better. Prescribed medication for blood pressure.",
    },
    {
      patientId: "6811ae73f6c7abffccdf0db0",
      doctorId: "6811ae73f6c7abffccdf0dac",
      date: "2023-11-16",
      time: "11:30",
      status: "scheduled",
      reason: "Headache and dizziness",
      notes: "",
    },
    {
      patientId: "6811ae73f6c7abffccdf0db1",
      doctorId: "6811ae73f6c7abffccdf0dab",
      date: "2023-11-17",
      time: "14:00",
      status: "scheduled",
      reason: "Annual physical",
      notes: "",
    },
    {
      patientId: "6811ae73f6c7abffccdf0db2",
      doctorId: "6811ae73f6c7abffccdf0dac",
      date: "2023-11-18",
      time: "09:30",
      status: "scheduled",
      reason: "Follow-up on medication",
      notes: "",
    },
    {
      patientId: "6811ae73f6c7abffccdf0db3",
      doctorId: "6811ae73f6c7abffccdf0dab",
      date: "2023-11-19",
      time: "16:00",
      status: "scheduled",
      reason: "Chest pain evaluation",
      notes: "",
    },
  ]);
};

const seedStaff = async () => {
  await Staff.deleteMany();
  await Staff.insertMany([
    {
      id: "1",
      firstName: "Anjali",
      lastName: "Desai",
      email: "anjali.desai@docmitr.com",
      phone: "+91 98765 67890",
      position: "Nurse",
      department: "General",
      joinDate: "2020-03-15",
      avatar: "/versus-concept.png",
    },
    {
      id: "2",
      firstName: "Rajesh",
      lastName: "Verma",
      email: "rajesh.verma@docmitr.com",
      phone: "+91 87654 78901",
      position: "Receptionist",
      department: "Front Desk",
      joinDate: "2019-06-22",
      avatar: "/recreational-vehicle-in-nature.png",
    },
    {
      id: "3",
      firstName: "Sunita",
      lastName: "Sharma",
      email: "sunita.sharma@docmitr.com",
      phone: "+91 76543 89012",
      position: "Lab Technician",
      department: "Laboratory",
      joinDate: "2021-01-10",
      avatar: "/playstation-controller-closeup.png",
    },
  ]);
};

const seedMedicalRecords = async () => {
  await MedicalRecord.deleteMany();
  await MedicalRecord.insertMany([
    {
      patientId: "6811af837c7d4476d411dce2",
      doctorId: "6811af837c7d4476d411dcde",
      date: "2023-11-15",
      diagnosis: "Hypertension",
      prescription: "Amlodipine 5mg daily",
      notes: "Blood pressure slightly elevated. Follow-up in 2 weeks.",
      attachments: [],
    },
    {
      patientId: "6811af837c7d4476d411dce3",
      doctorId: "6811af837c7d4476d411dcde",
      date: "2023-11-10",
      diagnosis: "Migraine",
      prescription: "Sumatriptan 50mg as needed",
      notes:
        "Patient reports frequent headaches. Recommended lifestyle changes.",
      attachments: [],
    },
    {
      patientId: "6811af837c7d4476d411dce6",
      doctorId: "6811af837c7d4476d411dcdf",
      date: "2023-11-05",
      diagnosis: "Healthy",
      prescription: "None",
      notes: "Annual physical examination. All vitals normal.",
      attachments: [],
    },
    {
      patientId: "6811af837c7d4476d411dce4",
      doctorId: "6811af837c7d4476d411dcde",
      date: "2023-10-28",
      diagnosis: "Seasonal allergies",
      prescription: "Cetirizine 10mg daily",
      notes:
        "Symptoms include sneezing and itchy eyes. Recommended avoiding allergens.",
      attachments: [],
    },
    {
      patientId: "6811af837c7d4476d411dce5",
      doctorId: "6811af837c7d4476d411dcdf",
      date: "2023-10-20",
      diagnosis: "Angina",
      prescription: "Nitroglycerin as needed",
      notes: "Experiencing chest pain on exertion. Scheduled stress test.",
      attachments: [],
    },
  ]);
};

const seedVitals = async () => {
  await Vital.deleteMany();
  await Vital.insertMany([
    {
      patientId: "6811af837c7d4476d411dce6",
      recordDate: "2023-11-15",
      bloodPressure: "140/90",
      heartRate: 78,
      temperature: 98.6,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      weight: 75,
      height: 175,
    },
    {
      patientId: "6811af837c7d4476d411dce2",
      recordDate: "2023-10-15",
      bloodPressure: "145/95",
      heartRate: 82,
      temperature: 98.4,
      respiratoryRate: 18,
      oxygenSaturation: 97,
      weight: 76,
      height: 175,
    },
    {
      patientId: "6811af837c7d4476d411dce3",
      recordDate: "2023-09-15",
      bloodPressure: "150/100",
      heartRate: 80,
      temperature: 98.8,
      respiratoryRate: 17,
      oxygenSaturation: 96,
      weight: 77,
      height: 175,
    },
    {
      patientId: "6811af837c7d4476d411dce4",
      recordDate: "2023-11-10",
      bloodPressure: "120/80",
      heartRate: 72,
      temperature: 98.2,
      respiratoryRate: 14,
      oxygenSaturation: 99,
      weight: 65,
      height: 165,
    },
  ]);
};

const seedSingleSlot = async () => {
  try {
    await SingleSlot.deleteMany();
    const slots = generateTimeSlots("09:00", "17:00", 30); // 9 AM to 5 PM, 30 mins

    await SingleSlot.insertMany(slots);

    console.log("✅ MongoDB seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

const seedSms = async () => {
  const templates = [
    {
      key: "After Appointment confirmation SMS to Patient",
      message: `"patient's name", your appointment has been confirmed with Dr "doctor name" at clinic name" on DD-MM-YYYY. Appointment will lapse by HH:MM pm and will be considered as a walk-in appointment`,
    },
    {
      key: "After Appointment confirmation SMS to Doctor",
      message: `"patient's name" has booked a confirmed appointment with you at "clinic name" for DD-MM-YYYY.`,
    },
    {
      key: "After Appointment confirmation SMS to Receptionists",
      message: `"patient's name" has booked a confirmed appointment with you at "clinic name" for DD-MM-YYYY.`,
    },
    {
      key: "One hour prior confirmed appointment reminder SMS",
      message: `"patient's name" has a confirmed appointment with Dr "Doctor's name" at XYZ time. Please reach the clinic 5 minutes prior`,
    },
    {
      key: "Day before appointment reminder SMS",
      message: `Reminder: "patient's name" has an appointment with Dr "Doctor's name" at "clinic name" tomorrow at HH:MM. Please confirm your attendance by replying YES or call "clinic number" to reschedule.`,
    },
    {
      key: `Appointment cancellation SMS (when patient cancel's appointment)`,
      message: `"patient's name" appointment that was scheduled with Dr "doctor's name" in 'clinic name' at 00.00 has been cancelled.`,
    },
    {
      key: `Appointment cancellation SMS (when reception cancels appointment)`,
      message: `"patient's name", your appointment with Dr "doctor's name" at 'clinic name' on DD-MM-YYYY has been cancelled. You can now book appointments, monitor patient queues, manage medical records, video-consult and stay in touch with us on our app 'mobile app link'`,
    },
    {
      key: "Reschedule Appointment SMS",
      message: `Hello "Patient's Name" We wanted to inform you that we had to reschedule your appointment on "New Date and Time" at "Clinic name"`,
    },
    {
      key: "After Online Appointment booking SMS for Online payment to Doctor",
      message: `"patient's name" appointment for Consultation has booked at "time". Consultation will start in next 5 minutes. Regards, Doctrz\n&\n"patient's name" appointment for Consultation has been booked for "time". Regards, Doctrz`,
    },
    {
      key: "Video consultation link SMS",
      message: `"patient's name", your video consultation with Dr "doctor's name" is scheduled for today at HH:MM. Click on this link to join: "video link". Please ensure you have a stable internet connection.`,
    },
    {
      key: "Bill amount SMS",
      message: `Thank you for visiting Dr "doctor's name" clinic. You need to pay Rs. XYZ/- at reception.`,
    },
    {
      key: "Amount collected edited in the invoice by receptionist",
      message: `"Receptionist's name" has edited the amount collected in the invoice section of the patient "patient's name" at XYZ time.`,
    },
    {
      key: "Payment reminder SMS",
      message: `Gentle Reminder: Rs. XYZ/- is pending at Dr "doctor's name" clinic. To know more details, call on Clinic Number "clinic number".`,
    },
    {
      key: "Payment confirmation SMS",
      message: `Thank you "patient's name". We have received your payment of Rs. XYZ/- for services at "clinic name". Your receipt number is "receipt number". For any queries, please contact us at "clinic number".`,
    },
    {
      key: "Prescription download link SMS",
      message: `Your prescription from Dr "doctor's name" is now available. Download it using this link: "prescription link".`,
    },
  ];

  await SMS.deleteMany({});
  await SMS.insertMany(templates);
};

const allergyNames = [
  "Penicillin",
  "Amoxicillin",
  "Ampicillin",
  "Cephalexin",
  "Ceftriaxone",
  "Erythromycin",
  "Clindamycin",
  "Vancomycin",
  "Sulfamethoxazole/Trimethoprim",
  "Aspirin",
  "Ibuprofen",
  "Naproxen",
  "Diclofenac",
  "Ketorolac",
  "Indomethacin",
  "Lidocaine",
  "Procaine",
  "Bupivacaine",
  "Articaine",
  "Phenytoin",
  "Carbamazepine",
  "Lamotrigine",
  "Valproic acid",
  "Heparin",
  "Allopurinol",
];

const seedAllergies = async () => {
  try {
    // Optional: clear existing data
    await Allergies.deleteMany({});
    console.log("Old allergy records deleted");

    const formatted = allergyNames.map((name) => ({ allergyName: name }));
    await Allergies.insertMany(formatted);
    console.log("Allergy names seeded successfully");

    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

// Run all seed functions
const seedAll = async () => {
  try {
    // await seedUsers();
    // await seedDoctors();
    // await seedPatients();
    // await seedAppointments();
    // await seedStaff();
    // await seedMedicalRecords();
    // await seedVitals();
    // await seedSingleSlot();

    // await seedSms();
    await seedAllergies();

    // const doc = await User.findOne({ email: "amit.sharma@docmitr.com" });

    // if (doc) {
    //   await Doctor.create({
    //     firstName: "Amit",
    //     lastName: "Sharma",
    //     email: "amit.sharma@docmitr.com",
    //     specialization: "Neurologist",
    //     phone: "+91 82948 37375",
    //     address: "123 Medical Lane, Mumbai",
    //     avatar: "/abstract-geometric-shapes.png",
    //     bio: "Experienced cardiologist with over 10 years of practice.",
    //     consultationFee: 1500,
    //     _id: doc._id,
    //   });
    // }

    console.log("✅ MongoDB seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

// Execute
seedAll();
