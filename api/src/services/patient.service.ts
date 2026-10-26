import { prisma } from "../lib/prisma.js";

export async function listPatients(query?: string) {
    const search = query?.trim();

    const patients = await prisma.patientProfile.findMany({
        where: search
            ? {
                OR: [
                    { firstName: { contains: search, mode: "insensitive" } },
                    { lastName: { contains: search, mode: "insensitive" } },
                    { user: { email: { contains: search, mode: "insensitive" } } },
                ],
            }
            : undefined,
        select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            user: {
                select: {
                    email: true,
                },
            },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    return patients.map(({ user, ...patient }) => ({
        ...patient,
        email: user.email,
    }));
}

export async function getPatientProfile(userId: number) {

    const patientProfile = await prisma.patientProfile.findUnique({
        where: {
            userId: userId
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
        },
    });

    if (!patientProfile) {
        throw new Error("Patient Profile Not Found");
    }

    return {
        profile: patientProfile,
    };
}