import { z } from "zod";

export const patientListQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
});
