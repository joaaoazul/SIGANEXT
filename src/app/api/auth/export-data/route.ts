import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, getClientId } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (user.role === "client") {
      const clientId = await getClientId(user);
      const client = await prisma.client.findFirst({
        where: { id: clientId, deletedAt: null },
        include: {
          bodyAssessments: { orderBy: { date: "desc" } },
          checkIns: { orderBy: { date: "desc" } },
          workoutLogs: { orderBy: { startedAt: "desc" } },
          trainingPlans: {
            include: {
              trainingPlan: {
                include: { workouts: { include: { exercises: { include: { exercise: true } } } } },
              },
            },
          },
          nutritionPlans: {
            include: {
              nutritionPlan: {
                include: { meals: { include: { foods: { include: { food: true } } } } },
              },
            },
          },
          bookings: { include: { bookingSlot: true }, orderBy: { date: "desc" } },
          feedbacks: { orderBy: { createdAt: "desc" } },
        },
      });

      if (!client) {
        return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
      }

      // Remove sensitive fields
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, managerId, userId, ...safeData } = client;

      const exportData = {
        exportDate: new Date().toISOString(),
        format: "RGPD Data Export — Art. 20 RGPD (Portabilidade dos dados)",
        personalData: {
          name: safeData.name,
          email: safeData.email,
          phone: safeData.phone,
          dateOfBirth: safeData.dateOfBirth,
          gender: safeData.gender,
          createdAt: safeData.createdAt,
        },
        physicalData: {
          height: safeData.height,
          weight: safeData.weight,
          bodyFat: safeData.bodyFat,
        },
        medicalData: {
          medicalConditions: safeData.medicalConditions,
          medications: safeData.medications,
          allergies: safeData.allergies,
          injuries: safeData.injuries,
          surgeries: safeData.surgeries,
          familyHistory: safeData.familyHistory,
          bloodPressure: safeData.bloodPressure,
          heartRate: safeData.heartRate,
        },
        lifestyleData: {
          occupation: safeData.occupation,
          sleepHours: safeData.sleepHours,
          stressLevel: safeData.stressLevel,
          smokingStatus: safeData.smokingStatus,
          alcoholConsumption: safeData.alcoholConsumption,
          activityLevel: safeData.activityLevel,
        },
        sportsData: {
          trainingExperience: safeData.trainingExperience,
          trainingFrequency: safeData.trainingFrequency,
          preferredTraining: safeData.preferredTraining,
          sportHistory: safeData.sportHistory,
        },
        goals: {
          primaryGoal: safeData.primaryGoal,
          secondaryGoal: safeData.secondaryGoal,
          targetWeight: safeData.targetWeight,
          motivation: safeData.motivation,
        },
        nutritionProfile: {
          dietaryRestrictions: safeData.dietaryRestrictions,
          foodAllergies: safeData.foodAllergies,
          mealsPerDay: safeData.mealsPerDay,
          waterIntake: safeData.waterIntake,
          supplementsUsed: safeData.supplementsUsed,
        },
        consent: {
          consentDate: safeData.consentDate,
          consentIp: safeData.consentIp,
        },
        bodyAssessments: safeData.bodyAssessments,
        checkIns: safeData.checkIns,
        workoutLogs: safeData.workoutLogs,
        trainingPlans: safeData.trainingPlans,
        nutritionPlans: safeData.nutritionPlans,
        bookings: safeData.bookings,
        feedbacks: safeData.feedbacks,
      };

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="dados-pessoais-${safeData.name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json"`,
        },
      });
    }

    // PT / admin export
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        specialties: true,
        location: true,
        socialLinks: true,
        createdAt: true,
        consentDate: true,
        consentIp: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      format: "RGPD Data Export — Art. 20 RGPD (Portabilidade dos dados)",
      personalData: dbUser,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="dados-pessoais-${dbUser.name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error("Export data error:", error);
    return NextResponse.json(
      { error: "Erro ao exportar dados" },
      { status: 500 }
    );
  }
}
