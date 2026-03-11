import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { logAuditFromRequest } from "@/lib/audit";
import { z } from "zod";
import { logger } from "@/lib/logger";

const nutritionPlanUpdateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  totalCalories: z.coerce.number().min(0).optional().nullable(),
  totalProtein: z.coerce.number().min(0).optional().nullable(),
  totalCarbs: z.coerce.number().min(0).optional().nullable(),
  totalFat: z.coerce.number().min(0).optional().nullable(),
  goal: z.string().max(200).optional().nullable(),
  meals: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    time: z.string().max(10).optional().nullable(),
    order: z.number().int().min(0).optional(),
    notes: z.string().max(2000).optional().nullable(),
    foods: z.array(z.object({
      id: z.string().optional(),
      foodId: z.string().min(1),
      quantity: z.number().min(0),
      unit: z.string().max(20).optional(),
      notes: z.string().max(500).optional().nullable(),
      order: z.number().int().min(0).optional(),
    })).optional(),
  })).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const plan = await prisma.nutritionPlan.findUnique({
      where: { id },
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

    if (!plan) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
    }

    // Ownership check: PT can only access own plans, athletes can access if assigned
    if (user.role === "client") {
      const isAssigned = plan.assignments.some((a: { clientId: string }) => a.clientId === user.id);
      if (!isAssigned) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    } else if (plan.userId !== user.id && user.role !== "superadmin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    return NextResponse.json(plan);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar plano" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  try {
    const { id } = await params;

    // Ownership check
    const existing = await prisma.nutritionPlan.findUnique({ where: { id }, select: { userId: true } });
    if (!existing) return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
    if (existing.userId !== user.id && user.role !== "superadmin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const raw = await request.json();
    const result = nutritionPlanUpdateSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const data = result.data;

    // Delete existing meals & foods and recreate
    await prisma.mealFood.deleteMany({
      where: { meal: { nutritionPlanId: id } },
    });
    await prisma.meal.deleteMany({
      where: { nutritionPlanId: id },
    });

    const plan = await prisma.nutritionPlan.update({
      where: { id },
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
            order: m.order ?? idx,
            notes: m.notes || null,
            foods: m.foods ? {
              create: m.foods.map((f, fIdx) => ({
                foodId: f.foodId,
                quantity: f.quantity,
                unit: f.unit || "g",
                notes: f.notes || null,
                order: f.order ?? fIdx,
              })),
            } : undefined,
          })),
        } : undefined,
      },
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
      },
    });

    logAuditFromRequest(request, "update_nutrition_plan", {
      entity: "NutritionPlan", entityId: id,
      userId: user.id, userEmail: user.email, userRole: user.role,
      details: { name: plan.name },
    });

    return NextResponse.json(plan);
  } catch (e) {
    logger.exception("Error updating nutrition plan", e);
    return NextResponse.json({ error: "Erro ao atualizar plano" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  try {
    const { id } = await params;

    // Ownership check
    const existing = await prisma.nutritionPlan.findUnique({ where: { id }, select: { userId: true } });
    if (!existing) return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
    if (existing.userId !== user.id && user.role !== "superadmin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    await prisma.nutritionPlan.delete({ where: { id } });

    logAuditFromRequest(request, "delete_nutrition_plan", {
      entity: "NutritionPlan", entityId: id,
      userId: user.id, userEmail: user.email, userRole: user.role,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao eliminar plano" }, { status: 500 });
  }
}
