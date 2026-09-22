import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";

const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN;
const sessionSecret = process.env.SESSION_SECRET;

if (!clientOrigin) {
    throw new Error("CLIENT_ORIGIN environment variable is required");
}

if (!sessionSecret) {
    throw new Error("SESSION_SECRET environment variable is required");
}

app.use(cors({
    origin: clientOrigin,
    credentials: true,
}));

app.use(cookieParser(sessionSecret));

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Hello, world!");
});

export default app;