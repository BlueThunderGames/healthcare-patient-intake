import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import patientRoutes from './routes/patient.routes.js'

const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN;

if (!clientOrigin) {
    throw new Error("CLIENT_ORIGIN environment variable is required");
}

app.use(cors({
    origin: clientOrigin,
    credentials: true,
}));

app.use(cookieParser());

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/patients", patientRoutes);

app.get("/", (req, res) => {
    res.send("Hello, world!");
});

export default app;