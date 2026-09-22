import type { Request, Response } from "express";
import { ZodError } from "zod";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { registerUser, loginUser } from "../services/auth.service.js";

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

        return res.status(500).json({
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "An unexpected error occurred",
            },
        });
    }
}

export async function loginController(req: Request, res: Response) {
    try {
        const input = loginSchema.parse(req.body);
        const result = await loginUser(input);

        res.cookie("session", String(result.user.id), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            signed: true,
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

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

        return res.status(500).json({
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "An unexpected error occurred",
            },
        });
    }
}   

export function meController(_req: Request, res: Response) {
    return res.status(200).json({
        user: res.locals.user,
    });
}