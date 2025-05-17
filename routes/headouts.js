import express from "express";
import { createHeadout } from "../controllers/headouts.js";

const router = express.Router();

router.post("/", createHeadout);

export const headoutRouter = router;
