import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
      ];
    }
    if (category) where.category = category;

    const foods = await prisma.food.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(foods);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar alimentos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  try {
    const data = await request.json();

    const food = await prisma.food.create({
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

    return NextResponse.json(food, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar alimento" }, { status: 500 });
  }
}
