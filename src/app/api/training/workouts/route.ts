import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Add workout to a training plan
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { trainingPlanId, name, dayOfWeek, notes, exercises } = data;

    if (!trainingPlanId || !name) {
      return NextResponse.json({ error: "trainingPlanId e name são obrigatórios" }, { status: 400 });
    }

    // Get current workout count for ordering
    const count = await prisma.workout.count({ where: { trainingPlanId } });

    const workout = await prisma.workout.create({
      data: {
        trainingPlanId,
        name,
        dayOfWeek: dayOfWeek ?? count,
        order: count,
        notes: notes || null,
        exercises: exercises?.length ? {
          create: exercises.map((ex: { exerciseId: string; sets?: number; reps?: string; restSeconds?: number; weight?: string; notes?: string }, idx: number) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets || 3,
            reps: ex.reps || "12",
            restSeconds: ex.restSeconds || 60,
            weight: ex.weight || null,
            notes: ex.notes || null,
            order: idx,
          })),
        } : undefined,
      },
      include: {
        exercises: {
          orderBy: { order: "asc" },
          include: { exercise: true },
        },
      },
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (e) {
    console.error("Error creating workout:", e);
    return NextResponse.json({ error: "Erro ao criar treino" }, { status: 500 });
  }
}

// DELETE - Remove workout
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    await prisma.workout.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao eliminar treino" }, { status: 500 });
  }
}
