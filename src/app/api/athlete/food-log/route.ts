import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, getClientId } from "@/lib/auth";
import { logger } from "@/lib/logger";

// GET /api/athlete/food-log?date=2025-03-01
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const clientId = await getClientId(user);
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date") || new Date().toISOString().slice(0, 10);

    const startOfDay = new Date(dateStr + "T00:00:00.000Z");
    const endOfDay = new Date(dateStr + "T23:59:59.999Z");

    const logs = await prisma.foodLog.findMany({
      where: {
        clientId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        entries: {
          include: { food: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Also get water for the day
    const water = await prisma.waterLog.findMany({
      where: {
        clientId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { createdAt: "asc" },
    });

    const totalWaterMl = water.reduce((sum, w) => sum + w.amountMl, 0);

    // Calculate daily totals
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    logs.forEach(log => {
      log.entries.forEach(entry => {
        const factor = entry.quantity / 100;
        totalCalories += entry.calories * factor;
        totalProtein += entry.protein * factor;
        totalCarbs += entry.carbs * factor;
        totalFat += entry.fat * factor;
      });
    });

    return NextResponse.json({
      date: dateStr,
      logs,
      water: { entries: water, totalMl: totalWaterMl },
      totals: {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat),
      },
    });
  } catch (error) {
    logger.exception("Food log GET error", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/athlete/food-log — Create a meal log
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const clientId = await getClientId(user);
    const body = await request.json();

    const { mealType, name, time, notes, date, entries, photos } = body;

    if (!mealType || !name) {
      return NextResponse.json({ error: "Tipo e nome da refeição são obrigatórios" }, { status: 400 });
    }

    const logDate = date ? new Date(date) : new Date();
    // Normalize to start of day
    logDate.setUTCHours(12, 0, 0, 0);

    const foodLog = await prisma.foodLog.create({
      data: {
        clientId,
        date: logDate,
        mealType,
        name,
        time: time || null,
        notes: notes || null,
        photos: photos ? JSON.stringify(photos) : null,
        entries: entries?.length > 0 ? {
          create: entries.map((e: { foodId?: string; name: string; quantity: number; unit?: string; calories: number; protein: number; carbs: number; fat: number; fiber?: number; order?: number }) => ({
            foodId: e.foodId || null,
            name: e.name,
            quantity: e.quantity || 100,
            unit: e.unit || "g",
            calories: e.calories || 0,
            protein: e.protein || 0,
            carbs: e.carbs || 0,
            fat: e.fat || 0,
            fiber: e.fiber || null,
            order: e.order || 0,
          })),
        } : undefined,
      },
      include: {
        entries: {
          include: { food: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(foodLog, { status: 201 });
  } catch (error) {
    logger.exception("Food log POST error", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
