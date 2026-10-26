import { Router } from "express";
import {
    loginController,
    logoutController,
    meController,
    registerController,
} from "../controllers/auth.controller.js";
import { loginRateLimit } from "../middleware/login-rate-limit.js";
import { requireAuth } from "../middleware/require-auth.js";

const router = Router();

router.post("/login", loginRateLimit, loginController);

router.post("/register", registerController);

router.post("/logout", logoutController);

router.get("/me", requireAuth, meController);

export default router;