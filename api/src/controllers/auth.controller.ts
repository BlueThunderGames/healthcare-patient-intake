import type { Request, Response } from "express";
import { ZodError } from "zod";
import { registerSchema } from "../validators/auth.validator.js";
import { registerUser } from "../services/auth.service.js";

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