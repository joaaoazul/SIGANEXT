import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

// GET /api/clients/[id]/food-logs?date=2025-03-01&days=7
// Trainer views a client's food diary
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: clientId } = await params;

    // Verify trainer owns this client
    const client = await prisma.client.findFirst({
      where: { id: clientId, managerId: user.id, deletedAt: null },
      select: { id: true, name: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date") || new Date().toISOString().slice(0, 10);
    const days = Math.min(parseInt(searchParams.get("days") || "1"), 30);

    const endDate = new Date(dateStr + "T23:59:59.999Z");
    const startDate = new Date(dateStr + "T00:00:00.000Z");
    startDate.setDate(startDate.getDate() - (days - 1));

    // Food logs
    const foodLogs = await prisma.foodLog.findMany({
      where: {
        clientId,
        date: { gte: startDate, lte: endDate },
      },
      include: {
        entries: {
          include: { food: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: [{ date: "desc" }, { createdAt: "asc" }],
    });

    // Water logs
    const waterLogs = await prisma.waterLog.findMany({
      where: {
        clientId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by day
    const dayMap: Record<string, { foodLogs: typeof foodLogs; waterMl: number }> = {};

    foodLogs.forEach(log => {
      const day = log.date.toISOString().slice(0, 10);
      if (!dayMap[day]) dayMap[day] = { foodLogs: [], waterMl: 0 };
      dayMap[day].foodLogs.push(log);
    });

    waterLogs.forEach(w => {
      const day = w.date.toISOString().slice(0, 10);
      if (!dayMap[day]) dayMap[day] = { foodLogs: [], waterMl: 0 };
      dayMap[day].waterMl += w.amountMl;
    });

    // Calculate daily totals
    const result = Object.entries(dayMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, data]) => {
        let calories = 0, protein = 0, carbs = 0, fat = 0;
        data.foodLogs.forEach(log => {
          log.entries.forEach(e => {
            const factor = e.quantity / 100;
            calories += e.calories * factor;
            protein += e.protein * factor;
            carbs += e.carbs * factor;
            fat += e.fat * factor;
          });
        });
        return {
          date,
          meals: data.foodLogs,
          waterMl: data.waterMl,
          totals: {
            calories: Math.round(calories),
            protein: Math.round(protein),
            carbs: Math.round(carbs),
            fat: Math.round(fat),
          },
        };
      });

    return NextResponse.json({ client, days: result });
  } catch (error) {
    logger.exception("Client food logs GET error", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
