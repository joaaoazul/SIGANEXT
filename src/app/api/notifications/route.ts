import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { z } from "zod";

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

  try {
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
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json({ error: "Erro ao carregar notificações" }, { status: 500 });
  }
}

// POST /api/notifications
export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const notificationSchema = z.object({
    title: z.string().min(1, "Título é obrigatório").max(200),
    message: z.string().min(1, "Mensagem é obrigatória").max(2000),
    type: z.enum(["info", "warning", "success", "error"]).optional().default("info"),
    clientId: z.string().optional().nullable(),
    isGlobal: z.boolean().optional().default(false),
  });

  const body = await request.json();
  const parsed = notificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { title, message, type, clientId, isGlobal } = parsed.data;

  // Verify clientId belongs to this PT's managed clients
  if (clientId && !isGlobal) {
    const client = await prisma.client.findFirst({
      where: { id: clientId, managerId: user.id },
      select: { id: true },
    });
    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }
  }

  try {
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
  } catch (error) {
    console.error("Notification create error:", error);
    return NextResponse.json({ error: "Erro ao criar notificação" }, { status: 500 });
  }
}
