import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        trainingPlans: {
          include: { trainingPlan: true },
          orderBy: { createdAt: "desc" },
        },
        nutritionPlans: {
          include: { nutritionPlan: true },
          orderBy: { createdAt: "desc" },
        },
        feedbacks: { orderBy: { createdAt: "desc" }, take: 10 },
        bodyAssessments: { orderBy: { date: "desc" } },
        bookings: {
          include: { bookingSlot: true },
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar cliente" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const client = await prisma.client.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender || null,
        notes: data.notes || null,
        status: data.status,
        height: data.height ? parseFloat(data.height) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        bodyFat: data.bodyFat ? parseFloat(data.bodyFat) : null,
        plan: data.plan || null,
        paymentStatus: data.paymentStatus,
        // Anamnesis - Medical
        medicalConditions: data.medicalConditions ?? undefined,
        medications: data.medications ?? undefined,
        allergies: data.allergies ?? undefined,
        injuries: data.injuries ?? undefined,
        surgeries: data.surgeries ?? undefined,
        familyHistory: data.familyHistory ?? undefined,
        bloodPressure: data.bloodPressure ?? undefined,
        heartRate: data.heartRate !== undefined ? (data.heartRate ? parseInt(data.heartRate) : null) : undefined,
        // Anamnesis - Lifestyle
        occupation: data.occupation ?? undefined,
        sleepHours: data.sleepHours !== undefined ? (data.sleepHours ? parseFloat(data.sleepHours) : null) : undefined,
        stressLevel: data.stressLevel !== undefined ? (data.stressLevel ? parseInt(data.stressLevel) : null) : undefined,
        smokingStatus: data.smokingStatus ?? undefined,
        alcoholConsumption: data.alcoholConsumption ?? undefined,
        activityLevel: data.activityLevel ?? undefined,
        // Anamnesis - Sports
        trainingExperience: data.trainingExperience ?? undefined,
        trainingFrequency: data.trainingFrequency !== undefined ? (data.trainingFrequency ? parseInt(data.trainingFrequency) : null) : undefined,
        preferredTraining: data.preferredTraining ?? undefined,
        sportHistory: data.sportHistory ?? undefined,
        // Anamnesis - Goals
        primaryGoal: data.primaryGoal ?? undefined,
        secondaryGoal: data.secondaryGoal ?? undefined,
        targetWeight: data.targetWeight !== undefined ? (data.targetWeight ? parseFloat(data.targetWeight) : null) : undefined,
        motivation: data.motivation ?? undefined,
        // Anamnesis - Nutrition
        dietaryRestrictions: data.dietaryRestrictions ?? undefined,
        foodAllergies: data.foodAllergies ?? undefined,
        mealsPerDay: data.mealsPerDay !== undefined ? (data.mealsPerDay ? parseInt(data.mealsPerDay) : null) : undefined,
        waterIntake: data.waterIntake !== undefined ? (data.waterIntake ? parseFloat(data.waterIntake) : null) : undefined,
        supplementsUsed: data.supplementsUsed ?? undefined,
      },
    });

    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao eliminar cliente" }, { status: 500 });
  }
}
