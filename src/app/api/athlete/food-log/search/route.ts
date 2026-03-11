import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, getClientId } from "@/lib/auth";
import { logger } from "@/lib/logger";

// GET /api/athlete/food-log/search?q=frango&limit=20
// Searches the food catalogue for adding to food logs
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const clientId = await getClientId(user);
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    if (q.length < 2) {
      return NextResponse.json([]);
    }

    // Get the client's managerId to find their trainer's foods
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { managerId: true },
    });

    // Search trainer's foods + global foods
    const foods = await prisma.food.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
        OR: [
          { userId: client?.managerId || undefined },
          { userId: null },
        ],
      },
      take: limit,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(foods);
  } catch (error) {
    logger.exception("Food search error", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
