import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// PUT /api/notifications/read-all - mark all as read
export async function PUT(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  await prisma.notification.updateMany({
    where: { senderId: user.id, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
