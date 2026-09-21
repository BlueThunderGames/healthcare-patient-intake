import { Router } from "express";
import { registerController } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", (req, res) => {
    // Handle login logic here
    res.send("Login route");
});

router.post("/register", registerController);

export default router;