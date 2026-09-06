import express from "express";
import { triggerSos, listSos, resolveSos } from "../controllers/sosController.js";

const router = express.Router();

router.post("/:elderId?", triggerSos);
router.get("/:elderId?", listSos);
router.put("/:elderId?/:id/resolve", resolveSos);

export default router;
