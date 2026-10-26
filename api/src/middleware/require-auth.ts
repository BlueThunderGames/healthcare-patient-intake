import type { NextFunction, Request, Response } from "express";
import {
    clearSessionCookieOptions,
    SESSION_COOKIE_NAME,
} from "../config/session.js";
import { getUserForSessionToken } from "../services/session.service.js";

function sendUnauthenticated(res: Response) {
    return res.status(401).json({
        error: {
            code: "UNAUTHENTICATED",
            message: "Authentication required",
        },
    });
}

export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const token = req.cookies[SESSION_COOKIE_NAME];

    if (typeof token !== "string") {
        return sendUnauthenticated(res);
    }

    const user = await getUserForSessionToken(token);

    if (!user) {
        res.clearCookie(SESSION_COOKIE_NAME, clearSessionCookieOptions);
        return sendUnauthenticated(res);
    }

    res.locals.user = user;
    next();
}