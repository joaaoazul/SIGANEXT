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

  // PT sees notifications they sent; Athlete sees notifications targeted to them or global
  const isAthlete = user.role === "client";
  const where: Record<string, unknown> = {};

  if (isAthlete) {
    // Athletes see notifications where clientId matches their id OR global notifications from their PT
    const client = await prisma.client.findUnique({
      where: { id: user.id },
      select: { managerId: true },
    });
    where.OR = [
      { clientId: user.id },
      { isGlobal: true, ...(client?.managerId ? { senderId: client.managerId } : {}) },
    ];
  } else {
    // PT sees notifications they created
    where.senderId = user.id;
  }

  if (type) where.type = type;
  if (read === "true") where.isRead = true;
  if (read === "false") where.isRead = false;

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Count unread
  const unreadCount = await prisma.notification.count({
    where: { ...where, isRead: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}

// POST /api/notifications
export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const body = await request.json();
  const { title, message, type = "info", clientId, isGlobal = false } = body;

  if (!title || !message) {
    return NextResponse.json({ error: "Título e mensagem são obrigatórios" }, { status: 400 });
  }

  const notification = await prisma.notification.create({
    data: {
      senderId: user.id,
      title,
      message,
      type,
      clientId: isGlobal ? null : clientId || null,
      isGlobal,
    },
  });

  return NextResponse.json(notification, { status: 201 });
}
