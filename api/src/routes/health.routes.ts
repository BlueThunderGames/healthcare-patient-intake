import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/health", (_req, res) => {
  return res.status(200).json({ status: "ok" });
});

router.get("/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({ status: "ready" });
  } catch {
    return res.status(503).json({ status: "not_ready" });
  }
});

export default router;
