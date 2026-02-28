import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// GET /api/athlete/content - Get published content for athletes
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");

    const where: Record<string, unknown> = { isPublished: true };
    if (category) where.category = category;
    if (type) where.type = type;

    const content = await prisma.content.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Get distinct categories and types for filters
    const categories = await prisma.content.findMany({
      where: { isPublished: true },
      select: { category: true },
      distinct: ["category"],
    });

    const types = await prisma.content.findMany({
      where: { isPublished: true },
      select: { type: true },
      distinct: ["type"],
    });

    return NextResponse.json({
      content,
      categories: categories.map((c) => c.category).filter(Boolean),
      types: types.map((t) => t.type).filter(Boolean),
    });
  } catch (error) {
    console.error("Athlete content GET error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
