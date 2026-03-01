import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  try {
    const plans = await prisma.nutritionPlan.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        meals: {
          orderBy: { order: "asc" },
          include: {
            foods: {
              orderBy: { order: "asc" },
              include: { food: true },
            },
          },
        },
        assignments: {
          where: { isActive: true },
          include: { client: { select: { id: true, name: true } } },
        },
        _count: { select: { assignments: true } },
      },
    });

    return NextResponse.json(plans);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar planos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  try {
    const data = await request.json();

    const plan = await prisma.nutritionPlan.create({
      data: {
        name: data.name,
        description: data.description || null,
        totalCalories: data.totalCalories ? parseFloat(data.totalCalories) : null,
        totalProtein: data.totalProtein ? parseFloat(data.totalProtein) : null,
        totalCarbs: data.totalCarbs ? parseFloat(data.totalCarbs) : null,
        totalFat: data.totalFat ? parseFloat(data.totalFat) : null,
        goal: data.goal || null,
        meals: data.meals ? {
          create: data.meals.map((m: { name: string; time?: string; notes?: string; foods?: { foodId: string; quantity: number; unit?: string }[] }, idx: number) => ({
            name: m.name,
            time: m.time || null,
            order: idx,
            notes: m.notes || null,
            foods: m.foods ? {
              create: m.foods.map((f: { foodId: string; quantity: number; unit?: string }, fIdx: number) => ({
                foodId: f.foodId,
                quantity: f.quantity,
                unit: f.unit || "g",
                order: fIdx,
              })),
            } : undefined,
          })),
        } : undefined,
      },
      include: { meals: { include: { foods: { include: { food: true } } } } },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao criar plano" }, { status: 500 });
  }
}
