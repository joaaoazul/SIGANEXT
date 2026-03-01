import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const feedbacks = await prisma.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(feedbacks);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar feedbacks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const data = await request.json();

    const feedback = await prisma.feedback.create({
      data: {
        clientId: data.clientId,
        senderId: data.senderId || null,
        type: data.type || "general",
        subject: data.subject,
        message: data.message,
        rating: data.rating ? parseInt(data.rating) : null,
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar feedback" }, { status: 500 });
  }
}
