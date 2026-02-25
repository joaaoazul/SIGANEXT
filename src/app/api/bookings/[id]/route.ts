import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// PUT /api/bookings/:id - update slot
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const slot = await prisma.bookingSlot.update({
    where: { id, userId: user.id },
    data: {
      ...(body.date && { date: new Date(body.date) }),
      ...(body.startTime && { startTime: body.startTime }),
      ...(body.endTime && { endTime: body.endTime }),
      ...(body.maxClients !== undefined && { maxClients: parseInt(body.maxClients) }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
    include: { bookings: { include: { client: true } } },
  });

  return NextResponse.json(slot);
}

// DELETE /api/bookings/:id - delete slot
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.bookingSlot.delete({ where: { id, userId: user.id } });
  return NextResponse.json({ success: true });
}
