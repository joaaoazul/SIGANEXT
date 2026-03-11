import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { logAuditFromRequest } from "@/lib/audit";
import { clientUpdateSchema } from "@/lib/schemas/client";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    // Security: athletes can only view their own data (IDOR prevention)
    const ownerFilter = user.role === "client" ? { id: user.id } : { managerId: user.id };
    const client = await prisma.client.findFirst({
      where: { id, deletedAt: null, ...ownerFilter },
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
        checkIns: { orderBy: { date: "desc" }, take: 30 },
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...sanitized } = client;

    // RGPD — Audit log: client data access
    logAuditFromRequest(request, "view_client", {
      entity: "Client",
      entityId: id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
    });

    return NextResponse.json(sanitized);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar cliente" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const { id } = await params;
    const raw = await request.json();

    // Validate input with Zod schema
    const parsed = clientUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // Verify ownership
    const existing = await prisma.client.findFirst({ where: { id, managerId: user.id } });
    if (!existing) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    
    const client = await prisma.client.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender ?? null,
        notes: data.notes ?? null,
        status: data.status ?? undefined,
        height: data.height ?? null,
        weight: data.weight ?? null,
        bodyFat: data.bodyFat ?? null,
        plan: data.plan ?? null,
        paymentStatus: data.paymentStatus ?? undefined,
        // Anamnesis - Medical
        medicalConditions: data.medicalConditions ?? undefined,
        medications: data.medications ?? undefined,
        allergies: data.allergies ?? undefined,
        injuries: data.injuries ?? undefined,
        surgeries: data.surgeries ?? undefined,
        familyHistory: data.familyHistory ?? undefined,
        bloodPressure: data.bloodPressure ?? undefined,
        heartRate: data.heartRate ?? undefined,
        // Anamnesis - Lifestyle
        occupation: data.occupation ?? undefined,
        sleepHours: data.sleepHours ?? undefined,
        stressLevel: data.stressLevel ?? undefined,
        smokingStatus: data.smokingStatus ?? undefined,
        alcoholConsumption: data.alcoholConsumption ?? undefined,
        activityLevel: data.activityLevel ?? undefined,
        // Anamnesis - Sports
        trainingExperience: data.trainingExperience ?? undefined,
        trainingFrequency: data.trainingFrequency ?? undefined,
        preferredTraining: data.preferredTraining ?? undefined,
        sportHistory: data.sportHistory ?? undefined,
        // Anamnesis - Goals
        primaryGoal: data.primaryGoal ?? undefined,
        secondaryGoal: data.secondaryGoal ?? undefined,
        targetWeight: data.targetWeight ?? undefined,
        motivation: data.motivation ?? undefined,
        // Anamnesis - Nutrition
        dietaryRestrictions: data.dietaryRestrictions ?? undefined,
        foodAllergies: data.foodAllergies ?? undefined,
        mealsPerDay: data.mealsPerDay ?? undefined,
        waterIntake: data.waterIntake ?? undefined,
        supplementsUsed: data.supplementsUsed ?? undefined,
      },
    });

    // RGPD — Audit log: client data modification
    logAuditFromRequest(request, "edit_client", {
      entity: "Client",
      entityId: id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details: { fields: Object.keys(data) },
    });

    return NextResponse.json({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      status: client.status,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (user.role === "client") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

    const { id } = await params;

    // Soft delete: set deletedAt timestamp instead of removing data
    const client = await prisma.client.findFirst({
      where: { id, deletedAt: null, managerId: user.id },
      select: { id: true, email: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const anonymizedEmail = `deleted_${id}@anonimizado.local`;
    const anonymizedName = "[Dados Removidos]";

    await prisma.$transaction(async (tx) => {
      // RGPD Art. 17 — Anonymize all personal + health data
      await tx.client.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: "inactive",
          name: anonymizedName,
          email: anonymizedEmail,
          phone: null,
          dateOfBirth: null,
          gender: null,
          avatar: null,
          notes: null,
          medicalConditions: null,
          medications: null,
          allergies: null,
          injuries: null,
          surgeries: null,
          familyHistory: null,
          bloodPressure: null,
          heartRate: null,
          occupation: null,
          smokingStatus: null,
          alcoholConsumption: null,
          dietaryRestrictions: null,
          foodAllergies: null,
          supplementsUsed: null,
          motivation: null,
          consentDate: null,
          consentIp: null,
          consentVersion: null,
        },
      });

      // Anonymize the User login account too
      await tx.user.updateMany({
        where: { email: client.email, role: "client" },
        data: {
          role: "deleted_client",
          name: anonymizedName,
          email: anonymizedEmail,
          phone: null,
          bio: null,
          avatar: null,
        },
      });
    });

    // RGPD — Audit log: client deletion (anonymization)
    logAuditFromRequest(request, "delete_client", {
      entity: "Client",
      entityId: id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details: { anonymizedEmail },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.exception("Client delete error", error);
    return NextResponse.json({ error: "Erro ao eliminar cliente" }, { status: 500 });
  }
}
