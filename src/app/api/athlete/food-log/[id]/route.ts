import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, getClientId } from "@/lib/auth";

// PUT /api/athlete/food-log/[id] — Update meal log (notes, photos, time)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const clientId = await getClientId(user);
    const { id } = await params;

    // Verify ownership
    const existing = await prisma.foodLog.findFirst({
      where: { id, clientId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Registo não encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const { name, time, notes, photos, mealType } = body;

    const updated = await prisma.foodLog.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(time !== undefined && { time }),
        ...(notes !== undefined && { notes }),
        ...(mealType !== undefined && { mealType }),
        ...(photos !== undefined && { photos: JSON.stringify(photos) }),
      },
      include: {
        entries: {
          include: { food: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Food log PUT error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE /api/athlete/food-log/[id] — Delete a meal log
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const clientId = await getClientId(user);
    const { id } = await params;

    const existing = await prisma.foodLog.findFirst({
      where: { id, clientId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Registo não encontrado" }, { status: 404 });
    }

    await prisma.foodLog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Food log DELETE error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
