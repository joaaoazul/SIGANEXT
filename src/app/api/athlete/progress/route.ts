import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// GET /api/athlete/progress - Get athlete's progress data
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const [client, checkIns, bodyAssessments] = await Promise.all([
      prisma.client.findUnique({
        where: { id: user.id },
        select: { weight: true, targetWeight: true, bodyFat: true, height: true },
      }),
      prisma.checkIn.findMany({
        where: { clientId: user.id },
        orderBy: { date: "desc" },
        take: 30,
      }),
      prisma.bodyAssessment.findMany({
        where: { clientId: user.id },
        orderBy: { date: "desc" },
        take: 10,
      }),
    ]);

    return NextResponse.json({ client, checkIns, bodyAssessments });
  } catch (error) {
    console.error("Athlete progress GET error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/athlete/progress - Create a check-in
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert: update if exists for today, create otherwise
    const checkIn = await prisma.checkIn.upsert({
      where: {
        clientId_date: {
          clientId: user.id,
          date: today,
        },
      },
      update: {
        mood: body.mood ?? undefined,
        energy: body.energy ?? undefined,
        sleep: body.sleep ?? undefined,
        soreness: body.soreness ?? undefined,
        stress: body.stress ?? undefined,
        trainedToday: body.trainedToday ?? undefined,
        followedDiet: body.followedDiet ?? undefined,
        waterLiters: body.waterLiters ?? undefined,
        weight: body.weight ?? undefined,
        notes: body.notes ?? undefined,
      },
      create: {
        clientId: user.id,
        date: today,
        mood: body.mood,
        energy: body.energy,
        sleep: body.sleep,
        soreness: body.soreness,
        stress: body.stress,
        trainedToday: body.trainedToday ?? false,
        followedDiet: body.followedDiet ?? false,
        waterLiters: body.waterLiters,
        weight: body.weight,
        notes: body.notes,
      },
    });

    // If weight was submitted, update client's current weight too
    if (body.weight) {
      await prisma.client.update({
        where: { id: user.id },
        data: { weight: body.weight },
      });
    }

    return NextResponse.json(checkIn);
  } catch (error) {
    console.error("Athlete progress POST error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
