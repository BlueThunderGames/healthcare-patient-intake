import type { Request, Response } from "express";
import { ZodError } from "zod";
import {
    clearSessionCookieOptions,
    SESSION_COOKIE_NAME,
    sessionCookieOptions,
} from "../config/session.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { registerUser, loginUser } from "../services/auth.service.js";
import { createSession, revokeSession } from "../services/session.service.js";

export async function registerController(req: Request, res: Response) {
    try {
        const input = registerSchema.parse(req.body);
        const result = await registerUser(input);

        return res.status(201).json(result);
    } catch (error) {
        if(error instanceof ZodError) {
            return res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid input",
                    details: error.issues.map((issue) => ({
                        path: issue.path,
                        message: issue.message,
                    })),
                },
            });
        }

        if(error instanceof Error && error.message === "User already exists") {
            return res.status(409).json({
                error: {
                    code: "USER_ALREADY_EXISTS",
                    message: error.message,
                },
            });
        }

        throw error;
    }
}

export async function loginController(req: Request, res: Response) {
    try {
        const input = loginSchema.parse(req.body);
        const result = await loginUser(input);
        const session = await createSession(result.user.id);

        res.cookie(
            SESSION_COOKIE_NAME,
            session.token,
            sessionCookieOptions,
        );

        return res.status(200).json(result);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid input",
                    details: error.issues.map((issue) => ({
                        path: issue.path,
                        message: issue.message,
                    })),
                },
            })
        }

        if (error instanceof Error && error.message === "Invalid credentials") {
            return res.status(401).json({
                error: {
                    code: "INVALID_CREDENTIALS",
                    message: "Invalid email or password",
                },
            })
        }

        throw error;
    }
}   

export function meController(_req: Request, res: Response) {
    return res.status(200).json({
        user: res.locals.user,
    });
}

export async function logoutController(req: Request, res: Response) {
    const token = req.cookies[SESSION_COOKIE_NAME];

    if (typeof token === "string") {
        await revokeSession(token);
    }

    res.clearCookie(SESSION_COOKIE_NAME, clearSessionCookieOptions);

    return res.status(204).send();
}