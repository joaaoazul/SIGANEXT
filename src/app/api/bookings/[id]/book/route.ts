import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// POST /api/bookings/:id/book - book a client into a slot
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const { clientId, notes } = await request.json();

  if (!clientId) {
    return NextResponse.json({ error: "Cliente obrigatório" }, { status: 400 });
  }

  const slot = await prisma.bookingSlot.findUnique({
    where: { id, userId: user.id },
    include: { bookings: true },
  });

  if (!slot) return NextResponse.json({ error: "Slot não encontrado" }, { status: 404 });
  if (!slot.isActive) return NextResponse.json({ error: "Slot não disponível" }, { status: 400 });
  if (slot.bookings.length >= slot.maxClients) {
    return NextResponse.json({ error: "Slot lotado" }, { status: 400 });
  }

  const booking = await prisma.booking.create({
    data: {
      bookingSlotId: id,
      clientId,
      date: slot.date || new Date(),
      notes: notes || null,
    },
    include: { client: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(booking, { status: 201 });
}
