import { prisma } from "../lib/prisma.js";
import type { AuditAction, Prisma } from "../generated/prisma/client.js";

type AuditEventInput = {
  actorUserId: number | null;
  action: AuditAction;
  resourceType: string;
  resourceId?: number | null;
  metadata?: Prisma.InputJsonValue;
};

export async function recordAuditEvent(event: AuditEventInput) {

  await prisma.auditEvent.create({
    data: {
      actorUserId: event.actorUserId,
      action: event.action,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      metadata: event.metadata,
    },
  });
}