import { prisma } from "@/lib/db";

export async function logAudit(params: {
  adminUserId: string;
  action: string;
  entityType: string;
  entityId?: string;
  previousValue?: unknown;
  newValue?: unknown;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        adminUserId: params.adminUserId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        previousValue: params.previousValue as any,
        newValue: params.newValue as any,
      },
    });
  } catch (err) {
    // Audit logging must never break the underlying mutation it's recording.
    console.error("Audit log write failed:", err);
  }
}
