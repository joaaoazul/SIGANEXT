import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const assignment = await prisma.nutritionPlanAssignment.create({
      data: {
        clientId: data.clientId,
        nutritionPlanId: data.nutritionPlanId,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao atribuir plano" }, { status: 500 });
  }
}
