import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const { id } = await params;
    const data = await request.json();

    const food = await prisma.food.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        calories: parseFloat(data.calories),
        protein: parseFloat(data.protein),
        carbs: parseFloat(data.carbs),
        fat: parseFloat(data.fat),
        fiber: data.fiber ? parseFloat(data.fiber) : null,
        sugar: data.sugar ? parseFloat(data.sugar) : null,
        sodium: data.sodium ? parseFloat(data.sodium) : null,
        isSupplement: data.isSupplement || false,
        brand: data.brand || null,
        servingSize: data.servingSize ? parseFloat(data.servingSize) : null,
        servingUnit: data.servingUnit || null,
      },
    });

    return NextResponse.json(food);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar alimento" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const { id } = await params;
    await prisma.food.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao eliminar alimento" }, { status: 500 });
  }
}
