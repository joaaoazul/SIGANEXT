import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const exercise = await prisma.exercise.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        muscleGroup: data.muscleGroup,
        equipment: data.equipment || null,
        videoUrl: data.videoUrl || null,
        thumbnailUrl: data.thumbnailUrl || null,
        difficulty: data.difficulty || "intermediate",
        instructions: data.instructions || null,
      },
    });

    return NextResponse.json(exercise);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar exercício" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.exercise.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao eliminar exercício" }, { status: 500 });
  }
}
