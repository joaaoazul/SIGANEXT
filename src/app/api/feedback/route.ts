import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: Math.min(limit, 200),
        skip: offset,
        include: {
          client: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.feedback.count({ where }),
    ]);

    return NextResponse.json(feedbacks, {
      headers: { "X-Total-Count": total.toString() },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar feedbacks" }, { status: 500 });
  }
}

const feedbackSchema = z.object({
  clientId: z.string().min(1, "ClientId é obrigatório"),
  senderId: z.string().optional().nullable(),
  type: z.string().max(50).optional(),
  subject: z.string().min(1, "Assunto é obrigatório").max(500),
  message: z.string().min(1, "Mensagem é obrigatória").max(5000),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
});

export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const raw = await request.json();
    const result = feedbackSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const data = result.data;

    const feedback = await prisma.feedback.create({
      data: {
        clientId: data.clientId,
        senderId: data.senderId || null,
        type: data.type || "general",
        subject: data.subject,
        message: data.message,
        rating: data.rating ?? null,
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar feedback" }, { status: 500 });
  }
}
