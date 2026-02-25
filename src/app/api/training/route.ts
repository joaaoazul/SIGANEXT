import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.trainingPlan.findMany({
      orderBy: { createdAt: "desc" },
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
    });

    return NextResponse.json(plans);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar planos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const plan = await prisma.trainingPlan.create({
      data: {
        name: data.name,
        description: data.description || null,
        duration: data.duration ? parseInt(data.duration) : null,
        goal: data.goal || null,
        difficulty: data.difficulty || "intermediate",
        workouts: data.workouts ? {
          create: data.workouts.map((w: { name: string; dayOfWeek?: number; notes?: string; exercises?: { exerciseId: string; sets?: number; reps?: string; restSeconds?: number; weight?: string; notes?: string }[] }, idx: number) => ({
            name: w.name,
            dayOfWeek: w.dayOfWeek ?? idx,
            order: idx,
            notes: w.notes || null,
            exercises: w.exercises ? {
              create: w.exercises.map((ex: { exerciseId: string; sets?: number; reps?: string; restSeconds?: number; weight?: string; notes?: string }, exIdx: number) => ({
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
