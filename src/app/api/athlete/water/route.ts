import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, getClientId } from "@/lib/auth";

// GET /api/athlete/water?date=2025-03-01
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

    const entries = await prisma.waterLog.findMany({
      where: {
        clientId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { createdAt: "asc" },
    });

    const totalMl = entries.reduce((sum, e) => sum + e.amountMl, 0);

    return NextResponse.json({ date: dateStr, entries, totalMl, glasses: entries.length });
  } catch (error) {
    console.error("Water GET error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/athlete/water — Add water entry
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const clientId = await getClientId(user);
    const body = await request.json();

    const amountMl = body.amountMl || 250;
    const dateStr = body.date || new Date().toISOString().slice(0, 10);
    const logDate = new Date(dateStr + "T12:00:00.000Z");

    const entry = await prisma.waterLog.create({
      data: {
        clientId,
        date: logDate,
        amountMl,
      },
    });

    // Get updated total
    const startOfDay = new Date(dateStr + "T00:00:00.000Z");
    const endOfDay = new Date(dateStr + "T23:59:59.999Z");
    const all = await prisma.waterLog.findMany({
      where: { clientId, date: { gte: startOfDay, lte: endOfDay } },
    });
    const totalMl = all.reduce((sum, e) => sum + e.amountMl, 0);

    return NextResponse.json({ entry, totalMl, glasses: all.length }, { status: 201 });
  } catch (error) {
    console.error("Water POST error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE /api/athlete/water — Remove last water entry for the day
export async function DELETE(request: NextRequest) {
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

    // Find the last entry for this day
    const last = await prisma.waterLog.findFirst({
      where: { clientId, date: { gte: startOfDay, lte: endOfDay } },
      orderBy: { createdAt: "desc" },
    });

    if (!last) {
      return NextResponse.json({ error: "Sem registos de água para remover" }, { status: 404 });
    }

    await prisma.waterLog.delete({ where: { id: last.id } });

    // Get updated total
    const all = await prisma.waterLog.findMany({
      where: { clientId, date: { gte: startOfDay, lte: endOfDay } },
    });
    const totalMl = all.reduce((sum, e) => sum + e.amountMl, 0);

    return NextResponse.json({ totalMl, glasses: all.length });
  } catch (error) {
    console.error("Water DELETE error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
