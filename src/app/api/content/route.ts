import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { z } from "zod";

const contentSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(300),
  description: z.string().max(5000).optional().nullable(),
  type: z.enum(["article", "video", "link", "document"]),
  category: z.string().max(100).optional().nullable(),
  url: z.string().url().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  isPublished: z.boolean().optional().default(true),
});

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

    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: Math.min(limit, 200),
        skip: offset,
      }),
      prisma.content.count({ where }),
    ]);

    return NextResponse.json(contents, {
      headers: { "X-Total-Count": total.toString() },
    });
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

  const raw = await request.json();
  const result = contentSchema.safeParse(raw);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }
  const data = result.data;

  const content = await prisma.content.create({
    data: {
      title: data.title,
      description: data.description || null,
      type: data.type,
      category: data.category || null,
      url: data.url || null,
      thumbnailUrl: data.thumbnailUrl || null,
      isPublished: data.isPublished,
    },
  });

  return NextResponse.json(content, { status: 201 });
}
