import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const assessment = await prisma.bodyAssessment.create({
      data: {
        clientId: id,
        weight: data.weight ? parseFloat(data.weight) : null,
        bodyFat: data.bodyFat ? parseFloat(data.bodyFat) : null,
        muscleMass: data.muscleMass ? parseFloat(data.muscleMass) : null,
        chest: data.chest ? parseFloat(data.chest) : null,
        waist: data.waist ? parseFloat(data.waist) : null,
        hips: data.hips ? parseFloat(data.hips) : null,
        arms: data.arms ? parseFloat(data.arms) : null,
        thighs: data.thighs ? parseFloat(data.thighs) : null,
        notes: data.notes || null,
      },
    });

    // Update client's latest weight/bodyFat
    if (data.weight || data.bodyFat) {
      await prisma.client.update({
        where: { id },
        data: {
          ...(data.weight ? { weight: parseFloat(data.weight) } : {}),
          ...(data.bodyFat ? { bodyFat: parseFloat(data.bodyFat) } : {}),
        },
      });
    }

    return NextResponse.json(assessment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar avaliação" }, { status: 500 });
  }
}
