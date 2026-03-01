import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, getClientId } from "@/lib/auth";

// GET /api/athlete/nutrition - Get athlete's nutrition plan
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const clientId = await getClientId(user);

    const assignments = await prisma.nutritionPlanAssignment.findMany({
      where: { clientId },
      include: {
        nutritionPlan: {
          include: {
            meals: {
              include: {
                foods: {
                  include: { food: true },
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
    console.error("Athlete nutrition GET error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
