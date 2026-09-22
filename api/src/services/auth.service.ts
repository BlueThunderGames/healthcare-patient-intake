import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { z } from "zod";

type RegisterInput = z.infer<typeof registerSchema>;

export async function registerUser(input: RegisterInput) {
    const hashedPassword = await bcrypt.hash(input.password, 10);
    
    const existingUser = await prisma.user.findUnique({
        where: {
            email: input.email
        }
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

   return await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email: input.email,
                passwordHash: hashedPassword,
                role: "PATIENT",
            }
        });

        const profile = await tx.patientProfile.create({
            data: {
                userId: user.id,
                firstName: input.profile.firstName,
                lastName: input.profile.lastName,
                dateOfBirth: input.profile.dateOfBirth,
            }
        });

        return {
            user: { id: user.id, email: user.email },
            profile: { id: profile.id, firstName: profile.firstName, lastName: profile.lastName, dateOfBirth: profile.dateOfBirth },
        };
    });
}

type LoginInput = z.infer<typeof loginSchema>;

export async function loginUser(input: LoginInput) {

    const user = await prisma.user.findUnique({
        where: {
            email: input.email,
        }
    });

    if (!user) {
        throw new Error("Invalid credentials");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

    if(!passwordMatches) {
        throw new Error("Invalid credentials");
    }

    return {
        user: {id: user.id, email: user.email, role: user.role }
    }
}