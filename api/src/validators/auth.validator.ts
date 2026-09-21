import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  profile: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dateOfBirth: z.coerce.date().refine((date) => date < new Date(), {
      message: "Date of birth must be in the past"
    }),
  })
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});