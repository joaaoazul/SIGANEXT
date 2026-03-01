import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// GET /api/bookings - list booking slots with bookings
export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  const where: Record<string, unknown> = { userId: user.id };
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    where.date = { gte: start, lt: end };
  }

  const slots = await prisma.bookingSlot.findMany({
    where,
    include: {
      bookings: {
        include: { client: { select: { id: true, name: true, email: true, phone: true } } },
      },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json(slots);
}

// POST /api/bookings - create a booking slot
export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const body = await request.json();
  const { date, startTime, endTime, maxClients = 1, notes, title = "PT Session" } = body;

  if (!date || !startTime || !endTime) {
    return NextResponse.json({ error: "Data, hora início e hora fim são obrigatórios" }, { status: 400 });
  }

  const slot = await prisma.bookingSlot.create({
    data: {
      userId: user.id,
      title,
      date: new Date(date),
      startTime,
      endTime,
      maxClients: parseInt(maxClients),
      notes: notes || null,
    },
    include: { bookings: { include: { client: true } } },
  });

  return NextResponse.json(slot, { status: 201 });
}
