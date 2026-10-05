import { prisma } from "../lib/prisma.js";
import { recordAuditEvent } from "./audit.service.js";

export class PatientProfileNotFoundError extends Error { }

export async function getMyRecord(userId: number) {

    const profile = await prisma.patientProfile.findUnique({
        where: { userId }, 
        select: {
            patientRecord: {
                select: { id: true, notes: true, createdAt: true, updatedAt: true }
            },
        },
    });

    if (!profile) {
        throw new PatientProfileNotFoundError();
    }

    const record = profile.patientRecord;

    if (record) {
        await recordAuditEvent({
            actorUserId: userId,
            action: "PATIENT_RECORD_VIEWED",
            resourceType: "PatientRecord",
            resourceId: record.id,
        });
    }

    return { record };
}

