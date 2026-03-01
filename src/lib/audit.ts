import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getClientIP } from "@/lib/rate-limit";

interface AuditEntry {
  action: string;
  entity?: string;
  entityId?: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

/**
 * Write an audit log entry. Fire-and-forget — never blocks or throws.
 */
export function logAudit(entry: AuditEntry) {
  prisma.auditLog
    .create({
      data: {
        action: entry.action,
        entity: entry.entity || null,
        entityId: entry.entityId || null,
        userId: entry.userId || null,
        userEmail: entry.userEmail || null,
        userRole: entry.userRole || null,
        ip: entry.ip || null,
        userAgent: entry.userAgent || null,
        details: entry.details ? JSON.stringify(entry.details) : null,
      },
    })
    .catch((err) => {
      console.error("[AuditLog] Failed to write entry:", err);
    });
}

/**
 * Convenience: create an audit entry from a request + user.
 */
export function logAuditFromRequest(
  request: NextRequest,
  action: string,
  opts: {
    entity?: string;
    entityId?: string;
    userId?: string;
    userEmail?: string;
    userRole?: string;
    details?: Record<string, unknown>;
  } = {}
) {
  logAudit({
    action,
    entity: opts.entity,
    entityId: opts.entityId,
    userId: opts.userId,
    userEmail: opts.userEmail,
    userRole: opts.userRole,
    ip: getClientIP(request) || undefined,
    userAgent: request.headers.get("user-agent") || undefined,
    details: opts.details,
  });
}
