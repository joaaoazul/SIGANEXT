import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Calculate BMI if height + weight available
    let bmi: number | null = null;
    const client = await prisma.client.findUnique({ where: { id }, select: { height: true, gender: true, dateOfBirth: true, weight: true } });
    const w = data.weight ? parseFloat(data.weight) : null;
    const h = client?.height || null;
    if (w && h) {
      bmi = Math.round((w / Math.pow(h / 100, 2)) * 10) / 10;
    }

    // Calculate BMR (Mifflin-St Jeor) if weight + height + age + gender
    let bmr: number | null = null;
    if (w && h && client?.dateOfBirth && client?.gender) {
      const age = Math.floor((Date.now() - new Date(client.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (client.gender === "male") {
        bmr = Math.round(10 * w + 6.25 * h - 5 * age + 5);
      } else {
        bmr = Math.round(10 * w + 6.25 * h - 5 * age - 161);
      }
    }

    const assessment = await prisma.bodyAssessment.create({
      data: {
        clientId: id,
        weight: w,
        bodyFat: data.bodyFat ? parseFloat(data.bodyFat) : null,
        muscleMass: data.muscleMass ? parseFloat(data.muscleMass) : null,
        chest: data.chest ? parseFloat(data.chest) : null,
        waist: data.waist ? parseFloat(data.waist) : null,
        hips: data.hips ? parseFloat(data.hips) : null,
        arms: data.arms ? parseFloat(data.arms) : null,
        thighs: data.thighs ? parseFloat(data.thighs) : null,
        calves: data.calves ? parseFloat(data.calves) : null,
        shoulders: data.shoulders ? parseFloat(data.shoulders) : null,
        neck: data.neck ? parseFloat(data.neck) : null,
        abdomen: data.abdomen ? parseFloat(data.abdomen) : null,
        visceralFat: data.visceralFat ? parseFloat(data.visceralFat) : null,
        waterPct: data.waterPct ? parseFloat(data.waterPct) : null,
        boneMass: data.boneMass ? parseFloat(data.boneMass) : null,
        metabolicAge: data.metabolicAge ? parseInt(data.metabolicAge) : null,
        bmi,
        bmr,
        notes: data.notes || null,
        photos: data.photos ? JSON.stringify(data.photos) : null,
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
  } catch (error) {
    console.error("Assessment create error:", error);
    return NextResponse.json({ error: "Erro ao criar avaliação" }, { status: 500 });
  }
}
