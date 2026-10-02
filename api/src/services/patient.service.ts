import { prisma } from "../lib/prisma.js";

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