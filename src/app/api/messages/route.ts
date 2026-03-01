import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// GET - List conversations for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId: user.id } },
      },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Batch-fetch all referenced users and clients in 2 queries (fix N+1)
    const allParticipants = conversations.flatMap((c) => c.participants);
    const userIds = [...new Set(allParticipants.map((p) => p.userId).filter(Boolean) as string[])];
    const clientIds = [...new Set(allParticipants.map((p) => p.clientId).filter(Boolean) as string[])];

    const [users, clients] = await Promise.all([
      userIds.length > 0
        ? prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, avatar: true } })
        : [],
      clientIds.length > 0
        ? prisma.client.findMany({ where: { id: { in: clientIds } }, select: { id: true, name: true, avatar: true } })
        : [],
    ]);
    const userMap = new Map(users.map((u) => [u.id, u]));
    const clientMap = new Map(clients.map((c) => [c.id, c]));

    // Batch unread counts in a single query
    const unreadCounts = await prisma.message.groupBy({
      by: ["conversationId"],
      where: {
        conversationId: { in: conversations.map((c) => c.id) },
        isRead: false,
        NOT: { senderId: user.id, senderType: "user" },
      },
      _count: true,
    });
    const unreadMap = new Map(unreadCounts.map((u) => [u.conversationId, u._count]));

    const enriched = conversations.map((conv) => {
      const otherParticipants = conv.participants.filter((p) => p.userId !== user.id);
      const names = otherParticipants.map((p) => {
        if (p.clientId) {
          const client = clientMap.get(p.clientId);
          return { name: client?.name || "Atleta", avatar: client?.avatar || null, type: "client" as const, id: p.clientId };
        }
        if (p.userId) {
          const u = userMap.get(p.userId);
          return { name: u?.name || "Utilizador", avatar: u?.avatar || null, type: "user" as const, id: p.userId };
        }
        return { name: "Desconhecido", avatar: null, type: "unknown" as const, id: "" };
      });

      const lastMessage = conv.messages[0] || null;

      return {
        id: conv.id,
        participants: names,
        lastMessage: lastMessage ? { content: lastMessage.content, createdAt: lastMessage.createdAt, senderType: lastMessage.senderType } : null,
        unreadCount: unreadMap.get(conv.id) || 0,
        updatedAt: conv.updatedAt,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Messages GET error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { clientId } = await request.json();
    if (!clientId) return NextResponse.json({ error: "clientId é obrigatório" }, { status: 400 });

    // Check if conversation already exists between this user and client
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: user.id } } },
          { participants: { some: { clientId } } },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ conversationId: existing.id });
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: user.id },
            { clientId },
          ],
        },
      },
    });

    return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
