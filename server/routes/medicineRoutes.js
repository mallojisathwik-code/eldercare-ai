import express from "express";
import { addMedicine, listMedicines, updateMedicine, deleteMedicine } from "../controllers/medicineController.js";

const router = express.Router();

router.get("/:elderId?", listMedicines);
router.post("/:elderId?", addMedicine);
router.put("/:elderId?/:id", updateMedicine);
router.delete("/:elderId?/:id", deleteMedicine);

export default router;
