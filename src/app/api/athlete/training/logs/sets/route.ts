import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, getClientId } from "@/lib/auth";

// POST /api/athlete/training/logs/sets - Log a completed set
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const clientId = await getClientId(user);

    const { workoutLogId, trainingExerciseId, setNumber, reps, weight, rpe, completed, notes } = await request.json();

    if (!workoutLogId || !trainingExerciseId || setNumber === undefined) {
      return NextResponse.json({ error: "workoutLogId, trainingExerciseId e setNumber obrigatórios" }, { status: 400 });
    }

    // Verify ownership
    const workoutLog = await prisma.workoutLog.findFirst({
      where: { id: workoutLogId, clientId },
    });
    if (!workoutLog) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
    }

    // Find or create exercise log
    let exerciseLog = await prisma.exerciseLog.findFirst({
      where: { workoutLogId, trainingExerciseId },
    });

    if (!exerciseLog) {
      // Get order from training exercise
      const te = await prisma.trainingExercise.findUnique({ where: { id: trainingExerciseId } });
      exerciseLog = await prisma.exerciseLog.create({
        data: {
          workoutLogId,
          trainingExerciseId,
          order: te?.order || 0,
        },
      });
    }

    // Upsert set log (update if same setNumber exists, otherwise create)
    const existingSet = await prisma.setLog.findFirst({
      where: { exerciseLogId: exerciseLog.id, setNumber },
    });

    let setLog;
    if (existingSet) {
      setLog = await prisma.setLog.update({
        where: { id: existingSet.id },
        data: {
          reps: reps !== undefined ? parseInt(reps) : existingSet.reps,
          weight: weight !== undefined ? parseFloat(weight) || null : existingSet.weight,
          rpe: rpe !== undefined ? parseFloat(rpe) || null : existingSet.rpe,
          completed: completed !== undefined ? completed : existingSet.completed,
          notes: notes !== undefined ? notes : existingSet.notes,
        },
      });
    } else {
      setLog = await prisma.setLog.create({
        data: {
          exerciseLogId: exerciseLog.id,
          setNumber,
          reps: reps ? parseInt(reps) : null,
          weight: weight ? parseFloat(weight) : null,
          rpe: rpe ? parseFloat(rpe) : null,
          completed: completed !== undefined ? completed : true,
          notes: notes || null,
        },
      });
    }

    return NextResponse.json(setLog, { status: 201 });
  } catch (error) {
    console.error("Set log POST error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
