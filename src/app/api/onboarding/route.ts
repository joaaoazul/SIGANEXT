import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";
import { onboardingSchema } from "@/lib/schemas/client";
import { getClientIP } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const result = onboardingSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const {
      inviteId, name, email, password,
      phone, dateOfBirth, gender,
      height, weight, bodyFat,
      medicalConditions, medications, allergies, injuries, surgeries,
      familyHistory, bloodPressure, heartRate,
      occupation, sleepHours, stressLevel, smokingStatus, alcoholConsumption, activityLevel,
      trainingExperience, trainingFrequency, preferredTraining, sportHistory,
      primaryGoal, secondaryGoal, targetWeight, motivation,
      dietaryRestrictions, foodAllergies, mealsPerDay, waterIntake, supplementsUsed,
      notes, photos,
    } = result.data;

    // RGPD: consent must be explicitly given
    const consent = raw.consent === true;
    if (!consent) {
      return NextResponse.json({ error: "O consentimento RGPD é obrigatório" }, { status: 400 });
    }
    const consentIp = getClientIP(request);

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

    // Use transaction so Client + User + Invite are updated atomically
    const client = await prisma.$transaction(async (tx) => {
      const newClient = await tx.client.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone: phone || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender || null,
          height: height ?? null,
          weight: weight ?? null,
          bodyFat: bodyFat ?? null,
          // Medical
          medicalConditions: medicalConditions || null,
          medications: medications || null,
          allergies: allergies || null,
          injuries: injuries || null,
          surgeries: surgeries || null,
          familyHistory: familyHistory || null,
          bloodPressure: bloodPressure || null,
          heartRate: heartRate ?? null,
          // Lifestyle
          occupation: occupation || null,
          sleepHours: sleepHours ?? null,
          stressLevel: stressLevel ?? null,
          smokingStatus: smokingStatus || null,
          alcoholConsumption: alcoholConsumption || null,
          activityLevel: activityLevel || null,
          // Sports
          trainingExperience: trainingExperience || null,
          trainingFrequency: trainingFrequency ?? null,
          preferredTraining: preferredTraining || null,
          sportHistory: sportHistory || null,
          // Goals
          primaryGoal: primaryGoal || null,
          secondaryGoal: secondaryGoal || null,
          targetWeight: targetWeight ?? null,
          motivation: motivation || null,
          // Nutrition
          dietaryRestrictions: dietaryRestrictions || null,
          foodAllergies: foodAllergies || null,
          mealsPerDay: mealsPerDay ?? null,
          waterIntake: waterIntake ?? null,
          supplementsUsed: supplementsUsed || null,
          notes: notes || null,
          consentDate: new Date(),
          consentIp: consentIp || null,
          status: "active",
          managerId: invite.invitedBy,
        },
      });

      // Also create a User record so the athlete can log in
      const userRecord = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "client",
        },
      });

      // Link User to Client
      await tx.client.update({
        where: { id: newClient.id },
        data: { userId: userRecord.id },
      });

      // Mark invite as accepted
      await tx.invite.update({
        where: { id: inviteId },
        data: { status: "accepted", clientId: newClient.id },
      });

      // Create initial body assessment if we have weight
      if (weight) {
        // Auto-calculate BMI and BMR
        const w = weight;
        const h = height || null;
        let bmi: number | undefined;
        let bmr: number | undefined;

        if (h && h > 0) {
          bmi = w / ((h / 100) ** 2);
        }

        // Mifflin-St Jeor: BMR
        if (h && dateOfBirth && gender) {
          const age = Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
          if (gender === "male") {
            bmr = 10 * w + 6.25 * h - 5 * age + 5;
          } else {
            bmr = 10 * w + 6.25 * h - 5 * age - 161;
          }
        }

        await tx.bodyAssessment.create({
          data: {
            clientId: newClient.id,
            weight: w,
            bodyFat: bodyFat ?? undefined,
            bmi: bmi ? parseFloat(bmi.toFixed(1)) : undefined,
            bmr: bmr ? parseFloat(bmr.toFixed(0)) : undefined,
            photos: photos || null,
          },
        });
      } else if (photos) {
        // Even without weight, save photos in assessment
        await tx.bodyAssessment.create({
          data: {
            clientId: newClient.id,
            weight: 0,
            photos,
          },
        });
      }

      return newClient;
    });

    // Send welcome email (non-blocking, outside transaction)
    try {
      await sendWelcomeEmail({
        to: email,
        athleteName: name,
        trainerName: trainer?.name || "O teu treinador",
      });
    } catch (emailErr) {
      console.error("Welcome email failed:", emailErr);
    }

    return NextResponse.json({ message: "Registo completo", clientId: client.id });
  } catch (error) {
    console.error("Onboarding error:", error);
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Email já registado no sistema" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
