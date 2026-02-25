import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      inviteId, name, email, password,
      // Personal
      phone, dateOfBirth, gender,
      // Physical
      height, weight, bodyFat,
      // Medical
      medicalConditions, medications, allergies, injuries, surgeries,
      familyHistory, bloodPressure, heartRate,
      // Lifestyle
      occupation, sleepHours, stressLevel, smokingStatus, alcoholConsumption, activityLevel,
      // Sports
      trainingExperience, trainingFrequency, preferredTraining, sportHistory,
      // Goals
      primaryGoal, secondaryGoal, targetWeight, motivation,
      // Nutrition
      dietaryRestrictions, foodAllergies, mealsPerDay, waterIntake, supplementsUsed,
      notes,
    } = body;

    if (!inviteId || !name || !email) {
      return NextResponse.json({ error: "Dados obrigatórios em falta" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Palavra-passe deve ter pelo menos 6 caracteres" }, { status: 400 });
    }

    // Verify invite
    const invite = await prisma.invite.findUnique({ where: { id: inviteId } });
    if (!invite || invite.status !== "pending") {
      return NextResponse.json({ error: "Convite inválido ou já utilizado" }, { status: 400 });
    }
    if (new Date() > invite.expiresAt) {
      await prisma.invite.update({ where: { id: inviteId }, data: { status: "expired" } });
      return NextResponse.json({ error: "Convite expirado" }, { status: 400 });
    }

    // Check if client already exists
    const existing = await prisma.client.findUnique({ where: { email } });
    if (existing) {
      await prisma.invite.update({ where: { id: inviteId }, data: { status: "accepted", clientId: existing.id } });
      return NextResponse.json({ message: "Perfil já existente - convite aceite", clientId: existing.id });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Get trainer info for welcome email
    const trainer = await prisma.user.findUnique({ where: { id: invite.invitedBy } });

    // Create client with full anamnesis
    const client = await prisma.client.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        bodyFat: bodyFat ? parseFloat(bodyFat) : null,
        // Medical
        medicalConditions: medicalConditions || null,
        medications: medications || null,
        allergies: allergies || null,
        injuries: injuries || null,
        surgeries: surgeries || null,
        familyHistory: familyHistory || null,
        bloodPressure: bloodPressure || null,
        heartRate: heartRate ? parseInt(heartRate) : null,
        // Lifestyle
        occupation: occupation || null,
        sleepHours: sleepHours ? parseFloat(sleepHours) : null,
        stressLevel: stressLevel ? parseInt(stressLevel) : null,
        smokingStatus: smokingStatus || null,
        alcoholConsumption: alcoholConsumption || null,
        activityLevel: activityLevel || null,
        // Sports
        trainingExperience: trainingExperience || null,
        trainingFrequency: trainingFrequency ? parseInt(trainingFrequency) : null,
        preferredTraining: preferredTraining || null,
        sportHistory: sportHistory || null,
        // Goals
        primaryGoal: primaryGoal || null,
        secondaryGoal: secondaryGoal || null,
        targetWeight: targetWeight ? parseFloat(targetWeight) : null,
        motivation: motivation || null,
        // Nutrition
        dietaryRestrictions: dietaryRestrictions || null,
        foodAllergies: foodAllergies || null,
        mealsPerDay: mealsPerDay ? parseInt(mealsPerDay) : null,
        waterIntake: waterIntake ? parseFloat(waterIntake) : null,
        supplementsUsed: supplementsUsed || null,
        notes: notes || null,
        status: "active",
        managerId: invite.invitedBy,
      },
    });

    // Also create a User record so the athlete can log in
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "client",
      },
    });

    // Mark invite as accepted
    await prisma.invite.update({
      where: { id: inviteId },
      data: { status: "accepted", clientId: client.id },
    });

    // Create initial body assessment if we have weight
    if (weight) {
      await prisma.bodyAssessment.create({
        data: {
          clientId: client.id,
          weight: parseFloat(weight),
          bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
        },
      });
    }

    // Send welcome email (non-blocking)
    try {
      await sendWelcomeEmail({
        to: email,
        athleteName: name,
        trainerName: trainer?.name || "O teu treinador",
      });
    } catch (emailErr) {
      console.error("Welcome email failed:", emailErr);
      // Don't fail registration if email fails
    }

    return NextResponse.json({ message: "Registo completo", clientId: client.id });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
