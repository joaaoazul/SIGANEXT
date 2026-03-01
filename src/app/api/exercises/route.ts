import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const muscleGroup = searchParams.get("muscleGroup") || "";
    const limit = parseInt(searchParams.get("limit") || "200");
    const offset = parseInt(searchParams.get("offset") || "0");

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

    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        orderBy: { name: "asc" },
        take: Math.min(limit, 500),
        skip: offset,
      }),
      prisma.exercise.count({ where }),
    ]);

    return NextResponse.json(exercises, {
      headers: { "X-Total-Count": total.toString() },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar exercícios" }, { status: 500 });
  }
}

const exerciseSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  muscleGroup: z.string().min(1, "Grupo muscular é obrigatório"),
  description: z.string().max(2000).optional().nullable(),
  equipment: z.string().max(200).optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  instructions: z.string().max(5000).optional().nullable(),
});

export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  try {
    const raw = await request.json();
    const result = exerciseSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const data = result.data;

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
