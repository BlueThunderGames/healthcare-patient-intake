import type { Request, Response } from "express";
import {
  getMyRecord,
  PatientProfileNotFoundError,
} from "../services/record.service.js";

export async function myPatientRecordController(
  _req: Request,
  res: Response,
) {
  const userId = res.locals.user.id;

  try {
    const result = await getMyRecord(userId);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof PatientProfileNotFoundError) {
      return res.status(404).json({
        error: {
          code: "PATIENT_PROFILE_NOT_FOUND",
          message: "Patient profile not found",
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
