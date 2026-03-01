import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getUser();
    if (!user || user.role !== "superadmin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

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
      prisma.client.count(),
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

    // Recent incidents
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

    // Recent audit logs
    const recentLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        action: true,
        entity: true,
        userEmail: true,
        ip: true,
        createdAt: true,
      },
    });

    // PT user breakdown
    const ptUsers = await prisma.user.count({ where: { role: "admin" } });
    const superadmins = await prisma.user.count({ where: { role: "superadmin" } });

    return NextResponse.json({
      system: {
        totalUsers,
        ptUsers,
        superadmins,
        totalClients,
        activeClients,
        deletedClients,
        usersLast24h,
        recentLogins,
        recentRegistrations,
      },
      content: {
        totalTrainingPlans,
        totalNutritionPlans,
        totalExercises,
        totalFoods,
        totalBookings,
        totalMessages,
        totalCheckIns,
      },
      incidents: {
        open: openIncidents,
        critical: criticalIncidents,
        recent: recentIncidents,
      },
      recentLogs,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
