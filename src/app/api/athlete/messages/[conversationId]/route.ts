import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// GET - Messages in conversation (for athlete)
export async function GET(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { conversationId } = await params;

    // Verify client is participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, clientId: user.id },
    });
    if (!participant) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const before = searchParams.get("before");

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        isRead: false,
        NOT: { senderId: user.id, senderType: "client" },
      },
      data: { isRead: true },
    });

    // Update lastReadAt
    await prisma.conversationParticipant.updateMany({
      where: { conversationId, clientId: user.id },
      data: { lastReadAt: new Date() },
    });

    return NextResponse.json(messages.reverse());
  } catch (error) {
    console.error("Athlete conversation messages GET error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST - Send message (from athlete)
export async function POST(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { conversationId } = await params;

    // Verify client is participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, clientId: user.id },
    });
    if (!participant) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

    const { content, type = "text" } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderType: "client",
        senderId: user.id,
        content: content.trim(),
        type,
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Athlete send message error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
