import { Router } from "express";
import { requireAuth } from "../middleware/require-auth.js";
import { patientController } from "../controllers/patient.controller.js";


const router = Router();

router.get('/me', requireAuth, patientController);

export default router;