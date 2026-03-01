import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, getClientId } from "@/lib/auth";

// GET /api/athlete/dashboard - Get athlete's dashboard data
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const clientId = await getClientId(user);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    client,
    activeTrainingPlan,
    activeNutritionPlan,
    upcomingBookings,
    todayCheckIn,
    recentCheckIns,
    unreadNotifications,
    recentContent,
  ] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        avatar: true,
        primaryGoal: true,
        weight: true,
        targetWeight: true,
        paymentStatus: true,
        plan: true,
        planEndDate: true,
      },
    }),
    prisma.trainingPlanAssignment.findFirst({
      where: { clientId, isActive: true },
      include: {
        trainingPlan: {
          include: {
            workouts: {
              include: {
                exercises: {
                  include: { exercise: true },
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.nutritionPlanAssignment.findFirst({
      where: { clientId, isActive: true },
      include: {
        nutritionPlan: {
          include: {
            meals: {
              include: {
                foods: { include: { food: true }, orderBy: { order: "asc" } },
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.findMany({
      where: {
        clientId,
        date: { gte: new Date() },
        status: "confirmed",
      },
      include: {
        bookingSlot: {
          select: { title: true, startTime: true, endTime: true, location: true },
        },
      },
      orderBy: { date: "asc" },
      take: 5,
    }),
    prisma.checkIn.findFirst({
      where: {
        clientId,
        date: { gte: today, lt: tomorrow },
      },
    }),
    prisma.checkIn.findMany({
      where: { clientId },
      orderBy: { date: "desc" },
      take: 7,
    }),
    prisma.notification.count({
      where: {
        OR: [
          { clientId, isRead: false },
          { isGlobal: true, isRead: false },
        ],
      },
    }),
    prisma.content.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

    return NextResponse.json({
      client: client || { id: clientId, name: user.name, avatar: null, primaryGoal: null, weight: null, targetWeight: null, paymentStatus: "pending", plan: null, planEndDate: null },
      activeTrainingPlan,
      activeNutritionPlan,
      upcomingBookings,
      todayCheckIn,
      recentCheckIns,
      unreadNotifications,
      recentContent,
    });
  } catch (error) {
    console.error("Athlete dashboard GET error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
