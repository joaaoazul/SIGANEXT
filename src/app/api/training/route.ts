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
      prisma.trainingPlan.findMany({
        orderBy: { createdAt: "desc" },
        take: Math.min(limit, 100),
        skip: offset,
        include: {
          workouts: {
            orderBy: { order: "asc" },
            include: {
              exercises: {
                orderBy: { order: "asc" },
                include: { exercise: true },
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
      prisma.trainingPlan.count(),
    ]);

    return NextResponse.json(plans, {
      headers: { "X-Total-Count": total.toString() },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar planos" }, { status: 500 });
  }
}

const trainingPlanSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  description: z.string().max(2000).optional().nullable(),
  duration: z.coerce.number().int().min(1).optional().nullable(),
  goal: z.string().max(200).optional().nullable(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  workouts: z.array(z.object({
    name: z.string().min(1),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    notes: z.string().max(2000).optional().nullable(),
    exercises: z.array(z.object({
      exerciseId: z.string().min(1),
      sets: z.number().int().min(1).optional(),
      reps: z.string().max(50).optional(),
      restSeconds: z.number().int().min(0).optional(),
      weight: z.string().max(50).optional().nullable(),
      notes: z.string().max(1000).optional().nullable(),
    })).optional(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  try {
    const raw = await request.json();
    const result = trainingPlanSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const data = result.data;

    const plan = await prisma.trainingPlan.create({
      data: {
        name: data.name,
        description: data.description || null,
        duration: data.duration ?? null,
        goal: data.goal || null,
        difficulty: data.difficulty || "intermediate",
        workouts: data.workouts ? {
          create: data.workouts.map((w, idx) => ({
            name: w.name,
            dayOfWeek: w.dayOfWeek ?? idx,
            order: idx,
            notes: w.notes || null,
            exercises: w.exercises ? {
              create: w.exercises.map((ex, exIdx) => ({
                exerciseId: ex.exerciseId,
                sets: ex.sets || 3,
                reps: ex.reps || "12",
                restSeconds: ex.restSeconds || 60,
                weight: ex.weight || null,
                notes: ex.notes || null,
                order: exIdx,
              })),
            } : undefined,
          })),
        } : undefined,
      },
      include: {
        workouts: {
          include: { exercises: { include: { exercise: true } } },
        },
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao criar plano" }, { status: 500 });
  }
}
