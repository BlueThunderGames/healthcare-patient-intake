import { Router } from "express";
import { requireAuth } from "../middleware/require-auth.js";
import { patientController } from "../controllers/patient.controller.js";
import { myPatientRecordController } from "../controllers/record.controller.js";
import { requireRole } from "../middleware/require-role.js";

const router = Router();

router.get("/me", requireAuth, patientController);
router.get(
  "/me/record",
  requireAuth,
  requireRole("PATIENT"),
  myPatientRecordController,
);

export default router;