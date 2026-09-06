import express from "express";
import { addElder, getLinkedElder, getLinkedElders, resetElderPassword } from "../controllers/familyController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/elder", getLinkedElder);
router.get("/elders", getLinkedElders);
router.post("/elder", addElder);
router.put("/elder/:elderId/password", resetElderPassword);

export default router;
