import { db } from "../db/index.js"

export const getDashboardStats = (req, res) => {
  try {
    // Get counts
    const patientCount = db.patients.length
    const doctorCount = db.doctors.length
    const appointmentCount = db.appointments.length
    const staffCount = db.staff.length

    // Get upcoming appointments
    const today = new Date()
    const upcomingAppointments = db.appointments
      .filter((a) => {
        const appointmentDate = new Date(`${a.date}T${a.time}`)
        return appointmentDate >= today && a.status === "scheduled"
      })
      .slice(0, 5)
      .map((appointment) => {
        const patient = db.patients.find((p) => p.id === appointment.patientId)
        const doctor = db.doctors.find((d) => d.id === appointment.doctorId)

        return {
          ...appointment,
          patient: patient
            ? {
                id: patient.id,
                name: `${patient.firstName} ${patient.lastName}`,
                avatar: patient.avatar,
              }
            : null,
          doctor: doctor
            ? {
                id: doctor.id,
                name: `${doctor.firstName} ${doctor.lastName}`,
                specialization: doctor.specialization,
              }
            : null,
        }
      })

    // Get recent patients
    const recentPatients = [...db.patients].sort((a, b) => b.id - a.id).slice(0, 5)

    // Get appointment statistics by month
    const appointmentsByMonth = [
      { month: "Jan", count: 12 },
      { month: "Feb", count: 19 },
      { month: "Mar", count: 15 },
      { month: "Apr", count: 22 },
      { month: "May", count: 28 },
      { month: "Jun", count: 24 },
      { month: "Jul", count: 30 },
      { month: "Aug", count: 27 },
      { month: "Sep", count: 32 },
      { month: "Oct", count: 35 },
      { month: "Nov", count: db.appointments.length },
      { month: "Dec", count: 0 },
    ]

    res.json({
      counts: {
        patients: patientCount,
        doctors: doctorCount,
        appointments: appointmentCount,
        staff: staffCount,
      },
      upcomingAppointments,
      recentPatients,
      appointmentsByMonth,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
