import { findById, findAll, create, update, remove } from "../db/index.js"

export const getStaff = (req, res) => {
  try {
    const result = findAll("staff", req.query)
    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

export const getStaffById = (req, res) => {
  try {
    const staff = findById("staff", req.params.id)

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" })
    }

    res.json(staff)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

export const createStaff = (req, res) => {
  try {
    const newStaff = create("staff", req.body)
    res.status(201).json(newStaff)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

export const updateStaff = (req, res) => {
  try {
    const updatedStaff = update("staff", req.params.id, req.body)

    if (!updatedStaff) {
      return res.status(404).json({ message: "Staff member not found" })
    }

    res.json(updatedStaff)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

export const deleteStaff = (req, res) => {
  try {
    const deletedStaff = remove("staff", req.params.id)

    if (!deletedStaff) {
      return res.status(404).json({ message: "Staff member not found" })
    }

    res.json({ message: "Staff member deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
