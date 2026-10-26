import type { Request, Response } from "express";
import { patientListQuerySchema } from "../validators/patient.validator.js";
import { getPatientProfile, listPatients } from "../services/patient.service.js";

export async function listPatientsController(req: Request, res: Response) {
    const query = patientListQuerySchema.parse(req.query);
    const patients = await listPatients(query.q);

    return res.status(200).json({ patients });
}

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

        throw error;
    }
}