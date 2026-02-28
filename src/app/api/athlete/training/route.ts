import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// GET /api/athlete/training - Get athlete's training plan
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const assignments = await prisma.trainingPlanAssignment.findMany({
      where: { clientId: user.id },
      include: {
        trainingPlan: {
          include: {
            workouts: {
              include: {
                exercises: {
                  include: { exercise: true },
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Athlete training GET error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
