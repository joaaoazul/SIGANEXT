import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

// POST - Add exercise to a workout
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const data = await request.json();
    const { workoutId, exerciseId, sets, reps, restSeconds, weight, rpe, notes } = data;

    if (!workoutId || !exerciseId) {
      return NextResponse.json({ error: "workoutId e exerciseId são obrigatórios" }, { status: 400 });
    }

    // Ownership check: verify workout's plan belongs to this user
    const workout = await prisma.workout.findUnique({ where: { id: workoutId }, select: { trainingPlan: { select: { userId: true } } } });
    if (!workout) return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    if (workout.trainingPlan.userId !== user.id && user.role !== "superadmin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // Get current exercise count for ordering
    const count = await prisma.trainingExercise.count({ where: { workoutId } });

    const trainingExercise = await prisma.trainingExercise.create({
      data: {
        workoutId,
        exerciseId,
        sets: sets || 3,
        reps: reps || "12",
        restSeconds: restSeconds || 60,
        weight: weight || null,
        rpe: rpe !== undefined ? parseFloat(rpe) : null,
        notes: notes || null,
        order: count,
      },
      include: { exercise: true },
    });

    return NextResponse.json(trainingExercise, { status: 201 });
  } catch (e) {
    logger.exception("Error adding exercise", e);
    return NextResponse.json({ error: "Erro ao adicionar exercício" }, { status: 500 });
  }
}

// PUT - Update training exercise (sets, reps, rest, etc.)
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const data = await request.json();
    const { id, sets, reps, restSeconds, weight, rpe, notes } = data;

    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    // Ownership check
    const existing = await prisma.trainingExercise.findUnique({ where: { id }, select: { workout: { select: { trainingPlan: { select: { userId: true } } } } } });
    if (!existing) return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 });
    if (existing.workout.trainingPlan.userId !== user.id && user.role !== "superadmin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const updated = await prisma.trainingExercise.update({
      where: { id },
      data: {
        sets: sets !== undefined ? sets : undefined,
        reps: reps !== undefined ? reps : undefined,
        restSeconds: restSeconds !== undefined ? restSeconds : undefined,
        weight: weight !== undefined ? weight : undefined,
        rpe: rpe !== undefined ? (rpe === null ? null : parseFloat(rpe)) : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
      include: { exercise: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar exercício" }, { status: 500 });
  }
}

// DELETE - Remove exercise from workout
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    // Ownership check
    const existing = await prisma.trainingExercise.findUnique({ where: { id }, select: { workout: { select: { trainingPlan: { select: { userId: true } } } } } });
    if (!existing) return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 });
    if (existing.workout.trainingPlan.userId !== user.id && user.role !== "superadmin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    await prisma.trainingExercise.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao remover exercício" }, { status: 500 });
  }
}
