import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { z } from "zod";

const bookingSlotSchema = z.object({
  date: z.string().optional(),
  startTime: z.string().min(1, "Hora início é obrigatória"),
  endTime: z.string().min(1, "Hora fim é obrigatória"),
  maxClients: z.coerce.number().int().min(1).max(50).optional().default(1),
  notes: z.string().max(1000).optional().nullable(),
  title: z.string().max(200).optional().default("PT Session"),
  isRecurring: z.boolean().optional().default(false),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

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

  const raw = await request.json();
  const result = bookingSlotSchema.safeParse(raw);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }
  const data = result.data;

  // Recurring slot: create one slot per matching day in the date range
  if (data.isRecurring && data.daysOfWeek?.length && data.dateFrom && data.dateTo) {
    const from = new Date(data.dateFrom);
    const to = new Date(data.dateTo);
    if (to < from) return NextResponse.json({ error: "Data fim deve ser após data início" }, { status: 400 });
    // Limit to 90 days max
    const maxDays = 90;
    const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > maxDays) return NextResponse.json({ error: `Intervalo máximo de ${maxDays} dias` }, { status: 400 });

    const slotsToCreate = [];
    const current = new Date(from);
    while (current <= to) {
      const jsDay = current.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      if (data.daysOfWeek.includes(jsDay)) {
        slotsToCreate.push({
          userId: user.id,
          title: data.title,
          date: new Date(current),
          startTime: data.startTime,
          endTime: data.endTime,
          maxClients: data.maxClients,
          notes: data.notes || null,
          isRecurring: true,
          dayOfWeek: jsDay,
        });
      }
      current.setDate(current.getDate() + 1);
    }

    if (slotsToCreate.length === 0) {
      return NextResponse.json({ error: "Nenhum dia corresponde aos dias selecionados" }, { status: 400 });
    }

    await prisma.bookingSlot.createMany({ data: slotsToCreate });
    return NextResponse.json({ created: slotsToCreate.length, message: `${slotsToCreate.length} slots criados` }, { status: 201 });
  }

  // Single slot
  if (!data.date) return NextResponse.json({ error: "Data é obrigatória" }, { status: 400 });

  const slot = await prisma.bookingSlot.create({
    data: {
      userId: user.id,
      title: data.title,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      maxClients: data.maxClients,
      notes: data.notes || null,
    },
    include: { bookings: { include: { client: true } } },
  });

  return NextResponse.json(slot, { status: 201 });
}
