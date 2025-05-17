import express from "express"
import { getDashboardStats } from "../controllers/dashboard.js"

const router = express.Router()

router.get("/stats", getDashboardStats)

export const dashboardRoutes = router
