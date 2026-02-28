import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const muscleGroup = searchParams.get("muscleGroup") || "";

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { equipment: { contains: search, mode: "insensitive" } },
      ];
    }
    if (muscleGroup) where.muscleGroup = muscleGroup;

    const difficulty = searchParams.get("difficulty") || "";
    if (difficulty) where.difficulty = difficulty;

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(exercises);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar exercícios" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const exercise = await prisma.exercise.create({
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

    return NextResponse.json(exercise, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar exercício" }, { status: 500 });
  }
}
