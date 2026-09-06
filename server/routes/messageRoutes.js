import express from "express";
import { sendMessage, listMessages, markPlayed } from "../controllers/messageController.js";

const router = express.Router();

router.post("/:elderId?", sendMessage);
router.get("/:elderId?", listMessages);
router.put("/:elderId?/:id/played", markPlayed);

export default router;
