import type { Request, Response } from "express";
import { getPatientProfile } from "../services/patient.service.js"

export async function patientController(_req: Request, res: Response) {
    try {
        const result = await getPatientProfile(res.locals.user.id);

        return res.status(200).json(result);
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Patient Profile Not Found"
        ) {
            return res.status(404).json({
                error: {
                    code: "PATIENT_PROFILE_NOT_FOUND",
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