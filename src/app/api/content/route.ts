import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// GET /api/content
export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const type = searchParams.get("type");
  const category = searchParams.get("category");

  try {
    const where: Record<string, unknown> = {};
    if (search) where.title = { contains: search, mode: "insensitive" };
    if (type) where.type = type;
    if (category) where.category = category;

    const contents = await prisma.content.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(contents);
  } catch (error) {
    console.error("Content GET error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST /api/content
export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const body = await request.json();
  const { title, description, type, category, url, thumbnailUrl, isPublished = true } = body;

  if (!title || !type) {
    return NextResponse.json({ error: "Título e tipo são obrigatórios" }, { status: 400 });
  }

  const content = await prisma.content.create({
    data: {
      title,
      description: description || null,
      type,
      category: category || null,
      url: url || null,
      thumbnailUrl: thumbnailUrl || null,
      isPublished,
    },
  });

  return NextResponse.json(content, { status: 201 });
}
