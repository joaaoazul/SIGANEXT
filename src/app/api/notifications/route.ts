import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// GET /api/notifications
export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const read = searchParams.get("read");

  const where: Record<string, unknown> = { senderId: user.id };
  if (type) where.type = type;
  if (read === "true") where.isRead = true;
  if (read === "false") where.isRead = false;

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(notifications);
}

// POST /api/notifications
export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await request.json();
  const { title, message, type = "info" } = body;

  if (!title || !message) {
    return NextResponse.json({ error: "Título e mensagem são obrigatórios" }, { status: 400 });
  }

  const notification = await prisma.notification.create({
    data: { senderId: user.id, title, message, type },
  });

  return NextResponse.json(notification, { status: 201 });
}
