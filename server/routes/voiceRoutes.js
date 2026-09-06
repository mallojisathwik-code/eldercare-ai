import express from "express";
import multer from "multer";
import { transcribeAudio } from "../controllers/voiceController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Contract matches docs/API.md exactly — check both sides when changing this route.
router.post("/transcribe", upload.single("audio"), transcribeAudio);

export default router;
