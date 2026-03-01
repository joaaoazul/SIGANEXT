import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, getClientId } from "@/lib/auth";

// GET - List conversations for current athlete (client)
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const clientId = await getClientId(user);

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { clientId } },
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

    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipants = conv.participants.filter((p) => p.clientId !== clientId);
        const names = await Promise.all(
          otherParticipants.map(async (p) => {
            if (p.userId) {
              const u = await prisma.user.findUnique({
                where: { id: p.userId },
                select: { name: true, avatar: true },
              });
              return { name: u?.name || "Personal Trainer", avatar: u?.avatar, type: "user" as const, id: p.userId };
            }
            if (p.clientId) {
              const client = await prisma.client.findUnique({
                where: { id: p.clientId },
                select: { name: true, avatar: true },
              });
              return { name: client?.name || "Atleta", avatar: client?.avatar, type: "client" as const, id: p.clientId };
            }
            return { name: "Desconhecido", avatar: null, type: "unknown" as const, id: "" };
          })
        );

        const lastMessage = conv.messages[0] || null;
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            isRead: false,
            NOT: { senderId: clientId, senderType: "client" },
          },
        });

        return {
          id: conv.id,
          participants: names,
          lastMessage: lastMessage
            ? { content: lastMessage.content, createdAt: lastMessage.createdAt, senderType: lastMessage.senderType }
            : null,
          unreadCount,
          updatedAt: conv.updatedAt,
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Athlete messages GET error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST - Create a new conversation (athlete can talk to PT or other athletes)
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const clientId = await getClientId(user);

    const { userId, clientId: targetClientId } = await request.json();

    if (!userId && !targetClientId) {
      return NextResponse.json({ error: "Destinatário é obrigatório" }, { status: 400 });
    }

    // Cannot message yourself
    if (targetClientId === clientId) {
      return NextResponse.json({ error: "Não podes enviar mensagem a ti próprio" }, { status: 400 });
    }

    // Check if conversation already exists
    const existingWhere = userId
      ? {
          AND: [
            { participants: { some: { clientId } } },
            { participants: { some: { userId } } },
          ],
        }
      : {
          AND: [
            { participants: { some: { clientId } } },
            { participants: { some: { clientId: targetClientId } } },
          ],
        };

    const existing = await prisma.conversation.findFirst({ where: existingWhere });

    if (existing) {
      return NextResponse.json({ conversationId: existing.id });
    }

    // Create new conversation
    const participantsCreate = userId
      ? [{ clientId }, { userId }]
      : [{ clientId }, { clientId: targetClientId }];

    const conversation = await prisma.conversation.create({
      data: {
        participants: { create: participantsCreate },
      },
    });

    return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
  } catch (error) {
    console.error("Athlete create conversation error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}


