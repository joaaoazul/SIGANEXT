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

    // Enrich with participant names
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipants = conv.participants.filter((p) => p.userId !== user.id);
        const names = await Promise.all(
          otherParticipants.map(async (p) => {
            if (p.clientId) {
              const client = await prisma.client.findUnique({ where: { id: p.clientId }, select: { name: true, avatar: true } });
              return { name: client?.name || "Atleta", avatar: client?.avatar, type: "client" as const, id: p.clientId };
            }
            if (p.userId) {
              const u = await prisma.user.findUnique({ where: { id: p.userId }, select: { name: true, avatar: true } });
              return { name: u?.name || "Utilizador", avatar: u?.avatar, type: "user" as const, id: p.userId };
            }
            return { name: "Desconhecido", avatar: null, type: "unknown" as const, id: "" };
          })
        );

        const lastMessage = conv.messages[0] || null;
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            isRead: false,
            NOT: { senderId: user.id, senderType: "user" },
          },
        });

        return {
          id: conv.id,
          participants: names,
          lastMessage: lastMessage ? { content: lastMessage.content, createdAt: lastMessage.createdAt, senderType: lastMessage.senderType } : null,
          unreadCount,
          updatedAt: conv.updatedAt,
        };
      })
    );

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
