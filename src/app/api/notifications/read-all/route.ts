import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// PUT /api/notifications/read-all - mark all as read
export async function PUT(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const isAthlete = user.role === "client";

  if (isAthlete) {
    // Mark notifications targeted to this athlete as read
    await prisma.notification.updateMany({
      where: { OR: [{ clientId: user.id }, { isGlobal: true }], isRead: false },
      data: { isRead: true },
    });
  } else {
    await prisma.notification.updateMany({
      where: { senderId: user.id, isRead: false },
      data: { isRead: true },
    });
  }

  return NextResponse.json({ success: true });
}
