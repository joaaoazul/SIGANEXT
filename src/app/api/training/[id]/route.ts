import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { logAuditFromRequest } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const plan = await prisma.trainingPlan.findUnique({
      where: { id },
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
          include: { client: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
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
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const { id } = await params;
    const data = await request.json();

    const plan = await prisma.trainingPlan.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        duration: data.duration ? parseInt(data.duration) : null,
        goal: data.goal || null,
        difficulty: data.difficulty || "intermediate",
      },
    });

    logAuditFromRequest(request, "update_training_plan", {
      entity: "TrainingPlan", entityId: id,
      userId: user.id, userEmail: user.email, userRole: user.role,
      details: { name: plan.name },
    });

    return NextResponse.json(plan);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar plano" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const { id } = await params;
    await prisma.trainingPlan.delete({ where: { id } });

    logAuditFromRequest(request, "delete_training_plan", {
      entity: "TrainingPlan", entityId: id,
      userId: user.id, userEmail: user.email, userRole: user.role,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao eliminar plano" }, { status: 500 });
  }
}
