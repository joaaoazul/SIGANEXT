import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, getClientId } from "@/lib/auth";
import { logger } from "@/lib/logger";

// GET /api/athlete/payments - Get athlete's payment info
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const clientId = await getClientId(user);

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        plan: true,
        planStartDate: true,
        planEndDate: true,
        paymentStatus: true,
      },
    });

    return NextResponse.json({ client: client || { plan: null, planStartDate: null, planEndDate: null, paymentStatus: "pending" } });
  } catch (error) {
    logger.exception("Athlete payments GET error", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
