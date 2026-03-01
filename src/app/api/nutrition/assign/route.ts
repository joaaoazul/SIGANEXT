import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { z } from "zod";

const assignSchema = z.object({
  clientId: z.string().min(1, "clientId é obrigatório"),
  nutritionPlanId: z.string().min(1, "nutritionPlanId é obrigatório"),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const raw = await request.json();
    const result = assignSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const data = result.data;

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
