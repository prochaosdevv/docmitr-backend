import bcrypt from "bcryptjs"
import { db } from "./db/index.js"

// Seed users
const seedUsers = async () => {
  const hashedAdminPassword = await bcrypt.hash("admin123", 10)
  const hashedDoctorPassword = await bcrypt.hash("doctor123", 10)

  db.users = [
    {
      id: "1",
      email: "admin@docmitr.com",
      password: hashedAdminPassword,
      name: "Admin User",
      role: "admin",
    },
    {
      id: "2",
      email: "ananya.gupta@docmitr.com",
      password: hashedDoctorPassword,
      name: "Dr. Ananya Gupta",
      role: "doctor",
    },
  ]
}

// Seed doctors
const seedDoctors = () => {
  db.doctors = [
    {
      id: "1",
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
      id: "2",
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
      id: "3",
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
  ]
}

// Seed patients
const seedPatients = () => {
  db.patients = [
    {
      id: "1",
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
      id: "2",
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
      id: "3",
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
      id: "4",
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
      id: "5",
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
  ]
}

// Seed appointments
const seedAppointments = () => {
  db.appointments = [
    {
      id: "1",
      patientId: "1",
      doctorId: "1",
      date: "2023-11-15",
      time: "10:00",
      status: "completed",
      reason: "Regular checkup",
      notes: "Patient reported feeling better. Prescribed medication for blood pressure.",
    },
    {
      id: "2",
      patientId: "2",
      doctorId: "2",
      date: "2023-11-16",
      time: "11:30",
      status: "scheduled",
      reason: "Headache and dizziness",
      notes: "",
    },
    {
      id: "3",
      patientId: "3",
      doctorId: "3",
      date: "2023-11-17",
      time: "14:00",
      status: "scheduled",
      reason: "Annual physical",
      notes: "",
    },
    {
      id: "4",
      patientId: "4",
      doctorId: "1",
      date: "2023-11-18",
      time: "09:30",
      status: "scheduled",
      reason: "Follow-up on medication",
      notes: "",
    },
    {
      id: "5",
      patientId: "5",
      doctorId: "2",
      date: "2023-11-19",
      time: "16:00",
      status: "scheduled",
      reason: "Chest pain evaluation",
      notes: "",
    },
  ]
}

// Seed staff
const seedStaff = () => {
  db.staff = [
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
  ]
}

// Seed medical records
const seedMedicalRecords = () => {
  db.medicalRecords = [
    {
      id: "1",
      patientId: "1",
      doctorId: "1",
      date: "2023-11-15",
      diagnosis: "Hypertension",
      prescription: "Amlodipine 5mg daily",
      notes: "Blood pressure slightly elevated. Follow-up in 2 weeks.",
      attachments: [],
    },
    {
      id: "2",
      patientId: "2",
      doctorId: "2",
      date: "2023-11-10",
      diagnosis: "Migraine",
      prescription: "Sumatriptan 50mg as needed",
      notes: "Patient reports frequent headaches. Recommended lifestyle changes.",
      attachments: [],
    },
    {
      id: "3",
      patientId: "3",
      doctorId: "3",
      date: "2023-11-05",
      diagnosis: "Healthy",
      prescription: "None",
      notes: "Annual physical examination. All vitals normal.",
      attachments: [],
    },
    {
      id: "4",
      patientId: "4",
      doctorId: "1",
      date: "2023-10-28",
      diagnosis: "Seasonal allergies",
      prescription: "Cetirizine 10mg daily",
      notes: "Symptoms include sneezing and itchy eyes. Recommended avoiding allergens.",
      attachments: [],
    },
    {
      id: "5",
      patientId: "5",
      doctorId: "2",
      date: "2023-10-20",
      diagnosis: "Angina",
      prescription: "Nitroglycerin as needed",
      notes: "Experiencing chest pain on exertion. Scheduled stress test.",
      attachments: [],
    },
  ]
}

// Seed vitals
const seedVitals = () => {
  db.vitals = [
    {
      id: "1",
      patientId: "1",
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
      id: "2",
      patientId: "1",
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
      id: "3",
      patientId: "1",
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
      id: "4",
      patientId: "2",
      recordDate: "2023-11-10",
      bloodPressure: "120/80",
      heartRate: 72,
      temperature: 98.2,
      respiratoryRate: 14,
      oxygenSaturation: 99,
      weight: 65,
      height: 165,
    },
    {
      id: "5",
      patientId: "3",
      recordDate: "2023-11-05",
      bloodPressure: "130/85",
      heartRate: 70,
      temperature: 98.6,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      weight: 80,
      height: 180,
    },
  ]
}

// Run all seed functions
const seedAll = async () => {
  await seedUsers()
  seedDoctors()
  seedPatients()
  seedAppointments()
  seedStaff()
  seedMedicalRecords()
  seedVitals()

  console.log("Database seeded successfully!")
}

// Execute the seed function
seedAll()
