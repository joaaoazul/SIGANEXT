import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, isAdmin } from "@/lib/auth";
import { cached } from "@/lib/cache";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const user = await getUser();
    if (!isAdmin(user)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Cache stats for 30 seconds — avoids hammering DB on dashboard auto-refresh
    const stats = await cached("admin:stats", 30, async () => {
      const [
        totalUsers,
        totalClients,
        activeClients,
        deletedClients,
        totalTrainingPlans,
        totalNutritionPlans,
        totalExercises,
        totalFoods,
        totalBookings,
        totalMessages,
        totalCheckIns,
        openIncidents,
        criticalIncidents,
        recentLogins,
        recentRegistrations,
        usersLast24h,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.client.count({ where: { deletedAt: null } }),
        prisma.client.count({ where: { status: "active", deletedAt: null } }),
        prisma.client.count({ where: { deletedAt: { not: null } } }),
        prisma.trainingPlan.count(),
        prisma.nutritionPlan.count(),
        prisma.exercise.count(),
        prisma.food.count(),
        prisma.booking.count(),
        prisma.message.count(),
        prisma.checkIn.count(),
        prisma.incident.count({ where: { status: { in: ["open", "investigating"] } } }),
        prisma.incident.count({ where: { severity: "critical", status: { in: ["open", "investigating"] } } }),
        prisma.auditLog.count({
          where: { action: "login", createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        }),
        prisma.user.count({
          where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        }),
        prisma.auditLog.count({
          where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        }),
      ]);

      const [recentIncidents, recentLogs, ptUsers, superadmins] = await Promise.all([
        prisma.incident.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true, title: true, severity: true,
            status: true, category: true, createdAt: true,
          },
        }),
        prisma.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true, action: true, entity: true,
            userEmail: true, ip: true, createdAt: true,
          },
        }),
        prisma.user.count({ where: { role: "admin" } }),
        prisma.user.count({ where: { role: "superadmin" } }),
      ]);

      return {
        system: {
          totalUsers, ptUsers, superadmins,
          totalClients, activeClients, deletedClients,
          usersLast24h, recentLogins, recentRegistrations,
        },
        content: {
          totalTrainingPlans, totalNutritionPlans,
          totalExercises, totalFoods, totalBookings,
          totalMessages, totalCheckIns,
        },
        incidents: {
          open: openIncidents,
          critical: criticalIncidents,
          recent: recentIncidents,
        },
        recentLogs,
      };
    });

    return NextResponse.json(stats);
  } catch (error) {
    logger.exception("Admin stats error", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}