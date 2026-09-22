import { Router } from "express";
import { registerController, loginController, meController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/require-auth.js";
const router = Router();

router.post("/login", loginController);

router.post("/register", registerController);

router.get("/me", requireAuth, meController);

export default router;