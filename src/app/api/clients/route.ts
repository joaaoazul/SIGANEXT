import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const payment = searchParams.get("payment") || "";

    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }
    if (status) where.status = status;
    if (payment) where.paymentStatus = payment;

    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        trainingPlans: {
          where: { isActive: true },
          include: { trainingPlan: { select: { name: true } } },
        },
        nutritionPlans: {
          where: { isActive: true },
          include: { nutritionPlan: { select: { name: true } } },
        },
      },
    });

    return NextResponse.json(clients);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const client = await prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender || null,
        notes: data.notes || null,
        status: data.status || "active",
        height: data.height ? parseFloat(data.height) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        bodyFat: data.bodyFat ? parseFloat(data.bodyFat) : null,
        plan: data.plan || null,
        paymentStatus: data.paymentStatus || "pending",
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro ao criar cliente";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Email já registado" }, { status: 400 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
