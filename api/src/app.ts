import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { env } from "./config/env.js";
import {
    errorHandler,
    notFoundHandler,
} from "./middleware/error-handler.js";
import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import patientRoutes from "./routes/patient.routes.js";

const app = express();

if (env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

app.use(helmet());

app.use(cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
}));

app.use(cookieParser());

app.use(express.json());

app.use(healthRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/patients", patientRoutes);

app.get("/", (req, res) => {
    res.send("Hello, world!");
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;