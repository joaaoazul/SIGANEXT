import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    return NextResponse.json(plan);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar plano" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.trainingPlan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao eliminar plano" }, { status: 500 });
  }
}
