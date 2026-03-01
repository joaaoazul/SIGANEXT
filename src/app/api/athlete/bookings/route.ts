import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, getClientId } from "@/lib/auth";

// GET /api/athlete/bookings - Get athlete's bookings
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const clientId = await getClientId(user);

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "upcoming";

  const now = new Date();
  const where: Record<string, unknown> = { clientId };

  if (filter === "upcoming") {
    where.date = { gte: now };
  } else if (filter === "past") {
    where.date = { lt: now };
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      bookingSlot: {
        select: {
          title: true,
          type: true,
          startTime: true,
          endTime: true,
          location: true,
          price: true,
        },
      },
    },
    orderBy: { date: filter === "past" ? "desc" : "asc" },
    take: 50,
  });

  // Also get available slots for booking
  const availableSlots = await prisma.bookingSlot.findMany({
    where: { isActive: true },
    select: {
      id: true,
      title: true,
      type: true,
      dayOfWeek: true,
      startTime: true,
      endTime: true,
      maxClients: true,
      price: true,
      location: true,
      isRecurring: true,
    },
    orderBy: { startTime: "asc" },
  });

    return NextResponse.json({ bookings, availableSlots });
  } catch (error) {
    console.error("Athlete bookings GET error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/athlete/bookings - Create a booking
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const clientId = await getClientId(user);

  const { bookingSlotId, date, notes } = await request.json();

  if (!bookingSlotId || !date) {
    return NextResponse.json({ error: "Slot e data são obrigatórios" }, { status: 400 });
  }

  // Check slot exists and has capacity
  const slot = await prisma.bookingSlot.findUnique({
    where: { id: bookingSlotId },
    include: {
      bookings: {
        where: {
          date: new Date(date),
          status: { not: "cancelled" },
        },
      },
    },
  });

  if (!slot || !slot.isActive) {
    return NextResponse.json({ error: "Slot não disponível" }, { status: 400 });
  }

  if (slot.bookings.length >= slot.maxClients) {
    return NextResponse.json({ error: "Sessão já está lotada" }, { status: 400 });
  }

  // Check if athlete already has a booking for this slot+date
  const existing = await prisma.booking.findFirst({
    where: {
      clientId,
      bookingSlotId,
      date: new Date(date),
      status: { not: "cancelled" },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "Já tens reserva para esta sessão" }, { status: 400 });
  }

  const booking = await prisma.booking.create({
    data: {
      clientId,
      bookingSlotId,
      date: new Date(date),
      notes,
      status: "confirmed",
    },
    include: {
      bookingSlot: {
        select: { title: true, startTime: true, endTime: true },
      },
    },
  });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Athlete bookings POST error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
