import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { z } from "zod";

const checkinSchema = z.object({
  clientId: z.string().min(1, "clientId é obrigatório"),
  mood: z.coerce.number().int().min(1).max(10).optional().nullable(),
  energy: z.coerce.number().int().min(1).max(10).optional().nullable(),
  sleep: z.coerce.number().int().min(1).max(10).optional().nullable(),
  soreness: z.coerce.number().int().min(1).max(10).optional().nullable(),
  stress: z.coerce.number().int().min(1).max(10).optional().nullable(),
  trainedToday: z.boolean().optional().default(false),
  followedDiet: z.boolean().optional().default(false),
  waterLiters: z.coerce.number().min(0).max(20).optional().nullable(),
  weight: z.coerce.number().min(20).max(500).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  photos: z.any().optional().nullable(),
});

// GET - List check-ins (optionally filtered by client)
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where = clientId ? { clientId } : {};

    const [checkins, total] = await Promise.all([
      prisma.checkIn.findMany({
        where,
        include: { client: { select: { id: true, name: true, avatar: true } } },
        orderBy: { date: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.checkIn.count({ where }),
    ]);

    return NextResponse.json({ checkins, total });
  } catch (error) {
    console.error("CheckIn GET error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST - Create a check-in (by client or by PT for a client)
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const raw = await request.json();
    const result = checkinSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const body = result.data;
    const { clientId, mood, energy, sleep, soreness, stress, trainedToday, followedDiet, waterLiters, weight, notes, photos } = body;

    if (!clientId) {
      return NextResponse.json({ error: "clientId é obrigatório" }, { status: 400 });
    }

    // Check if client exists
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });

    // Create today's date at midnight for unique constraint
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert so we don't duplicate for same day
    const checkin = await prisma.checkIn.upsert({
      where: { clientId_date: { clientId, date: today } },
      create: {
        clientId,
        date: today,
        mood: mood ?? null,
        energy: energy ?? null,
        sleep: sleep ?? null,
        soreness: soreness ?? null,
        stress: stress ?? null,
        trainedToday: trainedToday || false,
        followedDiet: followedDiet || false,
        waterLiters: waterLiters ?? null,
        weight: weight ?? null,
        notes: notes || null,
        photos: photos || null,
      },
      update: {
        mood: mood !== undefined ? mood : undefined,
        energy: energy !== undefined ? energy : undefined,
        sleep: sleep !== undefined ? sleep : undefined,
        soreness: soreness !== undefined ? soreness : undefined,
        stress: stress !== undefined ? stress : undefined,
        trainedToday: trainedToday !== undefined ? trainedToday : undefined,
        followedDiet: followedDiet !== undefined ? followedDiet : undefined,
        waterLiters: waterLiters !== undefined ? waterLiters : undefined,
        weight: weight !== undefined ? weight : undefined,
        notes: notes !== undefined ? notes : undefined,
        photos: photos !== undefined ? photos : undefined,
      },
    });

    return NextResponse.json(checkin, { status: 201 });
  } catch (error) {
    console.error("CheckIn POST error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
