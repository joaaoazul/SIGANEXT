import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// PUT /api/bookings/booking/:bookingId - update booking status
export async function PUT(request: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { bookingId } = await params;
  const { status } = await request.json();

  // Verify booking's slot belongs to this trainer
  const existing = await prisma.booking.findFirst({
    where: { id: bookingId, bookingSlot: { userId: user.id } },
  });
  if (!existing) return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 });

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: { client: { select: { id: true, name: true } } },
  });

  return NextResponse.json(booking);
}

// DELETE /api/bookings/booking/:bookingId - cancel booking
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { bookingId } = await params;

  // Verify booking's slot belongs to this trainer
  const existing = await prisma.booking.findFirst({
    where: { id: bookingId, bookingSlot: { userId: user.id } },
  });
  if (!existing) return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 });

  await prisma.booking.delete({ where: { id: bookingId } });
  return NextResponse.json({ success: true });
}
