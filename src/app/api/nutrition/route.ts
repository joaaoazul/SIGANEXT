import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const [plans, total] = await Promise.all([
      prisma.nutritionPlan.findMany({
        orderBy: { createdAt: "desc" },
        take: Math.min(limit, 100),
        skip: offset,
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
      }),
      prisma.nutritionPlan.count(),
    ]);

    return NextResponse.json(plans, {
      headers: { "X-Total-Count": total.toString() },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar planos" }, { status: 500 });
  }
}

const nutritionPlanSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  description: z.string().max(2000).optional().nullable(),
  totalCalories: z.coerce.number().min(0).optional().nullable(),
  totalProtein: z.coerce.number().min(0).optional().nullable(),
  totalCarbs: z.coerce.number().min(0).optional().nullable(),
  totalFat: z.coerce.number().min(0).optional().nullable(),
  goal: z.string().max(200).optional().nullable(),
  meals: z.array(z.object({
    name: z.string().min(1),
    time: z.string().max(10).optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
    foods: z.array(z.object({
      foodId: z.string().min(1),
      quantity: z.number().min(0),
      unit: z.string().max(20).optional(),
    })).optional(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  try {
    const raw = await request.json();
    const result = nutritionPlanSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const data = result.data;

    const plan = await prisma.nutritionPlan.create({
      data: {
        name: data.name,
        description: data.description || null,
        totalCalories: data.totalCalories ?? null,
        totalProtein: data.totalProtein ?? null,
        totalCarbs: data.totalCarbs ?? null,
        totalFat: data.totalFat ?? null,
        goal: data.goal || null,
        meals: data.meals ? {
          create: data.meals.map((m, idx) => ({
            name: m.name,
            time: m.time || null,
            order: idx,
            notes: m.notes || null,
            foods: m.foods ? {
              create: m.foods.map((f, fIdx) => ({
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
