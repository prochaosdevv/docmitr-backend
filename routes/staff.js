import express from "express"
import { getStaff, getStaffById, createStaff, updateStaff, deleteStaff } from "../controllers/staff.js"

const router = express.Router()

router.get("/", getStaff)
router.get("/:id", getStaffById)
router.post("/", createStaff)
router.put("/:id", updateStaff)
router.delete("/:id", deleteStaff)

export const staffRoutes = router
