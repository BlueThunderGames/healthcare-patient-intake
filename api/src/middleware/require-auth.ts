import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const session = req.signedCookies.session;

    if (typeof session !== "string") {
        return res.status(401).json({
            error: {
                code: "UNAUTHENTICATED",
                message: "Authentication required"
            },
        });
    }

    const userId = Number(session);

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(401).json({
            error: {
                code: "UNAUTHENTICATED",
                message: "Authentication required",
            },
        });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            role: true,
        },
    });

    if (!user) {
        return res.status(401).json({
            error: {
                code: "UNAUTHENTICATED",
                message: "Authentication required",
            },
        });
    }

    res.locals.user = user;
    next();
}