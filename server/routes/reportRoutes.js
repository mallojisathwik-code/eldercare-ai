import express from "express";
import { weeklyReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/:elderId?/weekly", weeklyReport);

export default router;
