import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// GET /api/athlete/training/logs - Get athlete's workout logs
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workoutId = searchParams.get("workoutId");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: { clientId: string; workoutId?: string } = { clientId: user.id };
    if (workoutId) where.workoutId = workoutId;

    const logs = await prisma.workoutLog.findMany({
      where,
      include: {
        workout: { select: { name: true } },
        exerciseLogs: {
          orderBy: { order: "asc" },
          include: {
            trainingExercise: {
              include: { exercise: { select: { name: true, muscleGroup: true } } },
            },
            setLogs: { orderBy: { setNumber: "asc" } },
          },
        },
      },
      orderBy: { startedAt: "desc" },
      take: limit,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Workout logs GET error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/athlete/training/logs - Start a new workout session
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { workoutId } = await request.json();
    if (!workoutId) {
      return NextResponse.json({ error: "workoutId obrigatório" }, { status: 400 });
    }

    // Verify the client has access to this workout (through assignment)
    const assignment = await prisma.trainingPlanAssignment.findFirst({
      where: {
        clientId: user.id,
        isActive: true,
        trainingPlan: {
          workouts: { some: { id: workoutId } },
        },
      },
    });

    if (!assignment) {
      // Debug: check what assignments exist for this client
      const allAssignments = await prisma.trainingPlanAssignment.findMany({
        where: { clientId: user.id },
        select: { id: true, isActive: true, trainingPlan: { select: { id: true, name: true, workouts: { select: { id: true } } } } },
      });
      console.error("No assignment found for workout start", {
        clientId: user.id,
        workoutId,
        existingAssignments: JSON.stringify(allAssignments),
      });

      // Fallback: verify the workout exists and belongs to any plan assigned to this client
      const workout = await prisma.workout.findUnique({ where: { id: workoutId } });
      if (!workout) {
        return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
      }

      // Allow starting if the workout exists and user has any assignment to its plan
      const anyAssignment = await prisma.trainingPlanAssignment.findFirst({
        where: {
          clientId: user.id,
          trainingPlanId: workout.trainingPlanId,
        },
      });

      if (!anyAssignment) {
        return NextResponse.json({ error: "Treino não atribuído ao teu plano" }, { status: 404 });
      }
    }

    const log = await prisma.workoutLog.create({
      data: {
        clientId: user.id,
        workoutId,
      },
      include: {
        workout: {
          include: {
            exercises: {
              orderBy: { order: "asc" },
              include: { exercise: true },
            },
          },
        },
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Workout log POST error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PUT /api/athlete/training/logs - Complete/update a workout session
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { logId, completedAt, duration, notes } = await request.json();
    if (!logId) {
      return NextResponse.json({ error: "logId obrigatório" }, { status: 400 });
    }

    const log = await prisma.workoutLog.update({
      where: { id: logId, clientId: user.id },
      data: {
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        duration: duration || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error("Workout log PUT error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
