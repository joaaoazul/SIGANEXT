import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, getClientId } from "@/lib/auth";

// POST /api/athlete/food-log/entries — Add entry to a meal log
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const clientId = await getClientId(user);
    const body = await request.json();

    const { foodLogId, foodId, name, quantity, unit, calories, protein, carbs, fat, fiber } = body;

    if (!foodLogId || !name) {
      return NextResponse.json({ error: "foodLogId e nome são obrigatórios" }, { status: 400 });
    }

    // Verify ownership of the food log
    const log = await prisma.foodLog.findFirst({
      where: { id: foodLogId, clientId },
    });
    if (!log) {
      return NextResponse.json({ error: "Registo não encontrado" }, { status: 404 });
    }

    // Get current max order
    const maxOrder = await prisma.foodLogEntry.findFirst({
      where: { foodLogId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const entry = await prisma.foodLogEntry.create({
      data: {
        foodLogId,
        foodId: foodId || null,
        name,
        quantity: quantity || 100,
        unit: unit || "g",
        calories: calories || 0,
        protein: protein || 0,
        carbs: carbs || 0,
        fat: fat || 0,
        fiber: fiber ?? null,
        order: (maxOrder?.order ?? -1) + 1,
      },
      include: { food: true },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Food log entry POST error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE /api/athlete/food-log/entries?id=xxx — Remove entry
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const clientId = await getClientId(user);
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get("id");

    if (!entryId) {
      return NextResponse.json({ error: "ID do item é obrigatório" }, { status: 400 });
    }

    // Verify ownership through food log
    const entry = await prisma.foodLogEntry.findUnique({
      where: { id: entryId },
      include: { foodLog: { select: { clientId: true } } },
    });

    if (!entry || entry.foodLog.clientId !== clientId) {
      return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
    }

    await prisma.foodLogEntry.delete({ where: { id: entryId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Food log entry DELETE error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
