import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, isAdmin } from "@/lib/auth";
import { logger } from "@/lib/logger";

// GET /api/admin/rgpd — RGPD compliance dashboard (admin only)
export async function GET() {
  try {
    const user = await getUser();
    if (!isAdmin(user)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // ── Users & consent stats ──
    const totalUsers = await prisma.user.count();
    const usersWithConsent = await prisma.user.count({
      where: { consentDate: { not: null } },
    });
    const usersWithHealthConsent = await prisma.user.count({
      where: { healthDataConsent: true },
    });
    const usersWithoutConsent = totalUsers - usersWithConsent;

    // Consent versions breakdown
    const consentVersions = await prisma.user.groupBy({
      by: ["consentVersion"],
      _count: { consentVersion: true },
      where: { consentVersion: { not: null } },
    });

    // ── Clients stats ──
    const totalClients = await prisma.client.count({ where: { managerId: user.id } });
    const clientsWithConsent = await prisma.client.count({
      where: { managerId: user.id, consentDate: { not: null } },
    });
    const clientsWithHealthConsent = await prisma.client.count({
      where: { managerId: user.id, healthDataConsent: true },
    });
    const activeClients = await prisma.client.count({
      where: { managerId: user.id, status: "active" },
    });
    const inactiveClients = totalClients - activeClients;

    // ── Audit log stats ──
    const totalAuditLogs = await prisma.auditLog.count();
    const last24hLogs = await prisma.auditLog.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
    const recentAuditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        userEmail: true,
        userRole: true,
        ip: true,
        createdAt: true,
        details: true,
      },
    });

    // Audit actions breakdown (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const auditActionBreakdown = await prisma.auditLog.groupBy({
      by: ["action"],
      _count: { action: true },
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { _count: { action: "desc" } },
      take: 15,
    });

    // Login attempts (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const loginAttempts = await prisma.auditLog.count({
      where: { action: "login", createdAt: { gte: sevenDaysAgo } },
    });
    const failedLogins = await prisma.auditLog.count({
      where: { action: "login_failed", createdAt: { gte: sevenDaysAgo } },
    });

    // ── Incidents ──
    const openIncidents = await prisma.incident.count({
      where: { status: { in: ["open", "investigating"] } },
    });
    const totalIncidents = await prisma.incident.count();
    const criticalIncidents = await prisma.incident.count({
      where: { severity: "critical", status: { in: ["open", "investigating"] } },
    });
    const recentIncidents = await prisma.incident.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        severity: true,
        status: true,
        category: true,
        createdAt: true,
      },
    });

    // ── Data retention ──
    // Check when last cleanup ran (from audit log)
    const lastCleanup = await prisma.auditLog.findFirst({
      where: { action: "data_retention_cleanup" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, details: true },
    });

    // ── Invites status ──
    const pendingInvites = await prisma.invite.count({
      where: { status: "pending", invitedBy: user.id },
    });
    const expiredInvites = await prisma.invite.count({
      where: { status: "expired", invitedBy: user.id },
    });

    // ── RGPD compliance checklist ──
    const { CURRENT_POLICY_VERSION: currentPolicyVersion } = await import("@/lib/constants");
    const compliance = {
      consentManagement: usersWithConsent > 0,
      healthDataConsent: usersWithHealthConsent > 0 || totalUsers === 0,
      auditLogging: totalAuditLogs > 0,
      dataRetentionPolicy: !!lastCleanup,
      incidentManagement: true, // Model exists
      dataIsolation: true, // managerId scoping implemented
      encryptionAtRest: true, // Supabase provides this
      encryptionInTransit: true, // HTTPS + HSTS headers
      rightToErasure: true, // Self-service via /api/auth/delete-account + admin purge
      selfServiceExport: true, // /api/auth/export-data (DSAR Art. 15 & 20)
      selfServiceDeletion: true, // /api/auth/delete-account (Art. 17)
      dataMinimization: true, // Only necessary fields collected
      privacyPolicy: true, // /privacy page exists
      cookiePolicy: true, // /cookies page exists
      dpia: true, // /dpia page exists
      dpa: true, // /dpa page exists
      securityHeaders: true, // CSP, HSTS, X-Frame-Options, etc. in next.config.ts
      csrfProtection: true, // Origin header validation in middleware
    };

    const complianceScore = Object.values(compliance).filter(Boolean).length;
    const complianceTotal = Object.keys(compliance).length;

    return NextResponse.json({
      consent: {
        totalUsers,
        usersWithConsent,
        usersWithHealthConsent,
        usersWithoutConsent,
        consentVersions: consentVersions.map((v) => ({
          version: v.consentVersion,
          count: v._count.consentVersion,
        })),
        currentPolicyVersion,
      },
      clients: {
        total: totalClients,
        active: activeClients,
        inactive: inactiveClients,
        withConsent: clientsWithConsent,
        withHealthConsent: clientsWithHealthConsent,
      },
      audit: {
        totalLogs: totalAuditLogs,
        last24h: last24hLogs,
        recentLogs: recentAuditLogs,
        actionBreakdown: auditActionBreakdown.map((a) => ({
          action: a.action,
          count: a._count.action,
        })),
        loginAttempts,
        failedLogins,
      },
      incidents: {
        total: totalIncidents,
        open: openIncidents,
        critical: criticalIncidents,
        recent: recentIncidents,
      },
      dataRetention: {
        lastCleanup: lastCleanup?.createdAt || null,
        lastCleanupDetails: lastCleanup?.details || null,
      },
      invites: {
        pending: pendingInvites,
        expired: expiredInvites,
      },
      compliance,
      complianceScore: {
        score: complianceScore,
        total: complianceTotal,
        percent: Math.round((complianceScore / complianceTotal) * 100),
      },
    });
  } catch (error) {
    logger.exception("RGPD stats error", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
