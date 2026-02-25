import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

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

    const body = await request.json();
    const { clientId, mood, energy, sleep, soreness, stress, trainedToday, followedDiet, waterLiters, weight, notes } = body;

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
        mood: mood ? parseInt(mood) : null,
        energy: energy ? parseInt(energy) : null,
        sleep: sleep ? parseInt(sleep) : null,
        soreness: soreness ? parseInt(soreness) : null,
        stress: stress ? parseInt(stress) : null,
        trainedToday: trainedToday || false,
        followedDiet: followedDiet || false,
        waterLiters: waterLiters ? parseFloat(waterLiters) : null,
        weight: weight ? parseFloat(weight) : null,
        notes: notes || null,
      },
      update: {
        mood: mood ? parseInt(mood) : undefined,
        energy: energy ? parseInt(energy) : undefined,
        sleep: sleep ? parseInt(sleep) : undefined,
        soreness: soreness ? parseInt(soreness) : undefined,
        stress: stress ? parseInt(stress) : undefined,
        trainedToday: trainedToday !== undefined ? trainedToday : undefined,
        followedDiet: followedDiet !== undefined ? followedDiet : undefined,
        waterLiters: waterLiters ? parseFloat(waterLiters) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    return NextResponse.json(checkin, { status: 201 });
  } catch (error) {
    console.error("CheckIn POST error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
