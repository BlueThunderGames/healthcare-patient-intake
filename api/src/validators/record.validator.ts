import { z } from "zod";

export const recordValidator = z.object({
    patientId: z.number().int().positive(),
    notes: z.string().min(1),
});