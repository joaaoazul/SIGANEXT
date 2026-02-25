import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// PUT /api/notifications/:id - mark as read/unread
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const notification = await prisma.notification.update({
    where: { id, senderId: user.id },
    data: { isRead: body.isRead ?? true },
  });

  return NextResponse.json(notification);
}

// DELETE /api/notifications/:id
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.notification.delete({ where: { id, senderId: user.id } });
  return NextResponse.json({ success: true });
}
