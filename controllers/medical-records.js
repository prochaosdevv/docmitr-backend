import { db, findById, findAll, create, update, remove } from "../db/index.js"

export const getMedicalRecords = (req, res) => {
  try {
    const result = findAll("medicalRecords", req.query)

    // Enrich with patient and doctor information
    const enrichedRecords = result.data.map((record) => {
      const patient = findById("patients", record.patientId)
      const doctor = findById("doctors", record.doctorId)

      return {
        ...record,
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

    res.json({
      data: enrichedRecords,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

export const getMedicalRecordById = (req, res) => {
  try {
    const record = findById("medicalRecords", req.params.id)

    if (!record) {
      return res.status(404).json({ message: "Medical record not found" })
    }

    // Enrich with patient and doctor information
    const patient = findById("patients", record.patientId)
    const doctor = findById("doctors", record.doctorId)

    const enrichedRecord = {
      ...record,
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

    res.json(enrichedRecord)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

export const createMedicalRecord = (req, res) => {
  try {
    const newRecord = create("medicalRecords", req.body)
    res.status(201).json(newRecord)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

export const updateMedicalRecord = (req, res) => {
  try {
    const updatedRecord = update("medicalRecords", req.params.id, req.body)

    if (!updatedRecord) {
      return res.status(404).json({ message: "Medical record not found" })
    }

    res.json(updatedRecord)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

export const deleteMedicalRecord = (req, res) => {
  try {
    const deletedRecord = remove("medicalRecords", req.params.id)

    if (!deletedRecord) {
      return res.status(404).json({ message: "Medical record not found" })
    }

    res.json({ message: "Medical record deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

export const getVitals = (req, res) => {
  try {
    const { patientId } = req.query

    if (patientId) {
      const patientVitals = db.vitals.filter((v) => v.patientId === patientId)
      return res.json({
        data: patientVitals,
        pagination: {
          total: patientVitals.length,
          page: 1,
          limit: patientVitals.length,
          pages: 1,
        },
      })
    }

    const result = findAll("vitals", req.query)
    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

export const createVitals = (req, res) => {
  try {
    const newVitals = create("vitals", req.body)
    res.status(201).json(newVitals)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

export const updateVitals = (req, res) => {
  try {
    const updatedVitals = update("vitals", req.params.id, req.body)

    if (!updatedVitals) {
      return res.status(404).json({ message: "Vitals record not found" })
    }

    res.json(updatedVitals)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

export const deleteVitals = (req, res) => {
  try {
    const deletedVitals = remove("vitals", req.params.id)

    if (!deletedVitals) {
      return res.status(404).json({ message: "Vitals record not found" })
    }

    res.json({ message: "Vitals record deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
