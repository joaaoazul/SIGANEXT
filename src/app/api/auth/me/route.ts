import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// GET /api/auth/me
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // 1. Lógica para quando um Atleta faz login
    if (user.role === "client") {
      const data = await prisma.client.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, email: true, phone: true, avatar: true, createdAt: true, consentVersion: true },
      });
      if (!data) {
        console.error("auth/me: Client not found in DB for id:", user.id);
        return NextResponse.json({ role: "client", id: user.id, name: user.name, email: user.email });
      }
      return NextResponse.json({ ...data, role: "client" });
    }

    // 2. Lógica para quando o PT / Admin faz login
    const data = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        phone: true, 
        role: true, 
        avatar: true, 
        createdAt: true, 
        consentVersion: true,
        plan: true // ADICIONADO: Vai buscar o plano do Treinador (starter, pro, elite)
      },
    });

    // 3. ADICIONADO: Lógica de negócio SaaS - Contar atletas ativos
    const activeClientsCount = await prisma.client.count({
      where: {
        managerId: user.id,
        status: "active",
        deletedAt: null
      }
    });

    // Devolve os dados normais + a contagem para a barra de progresso no frontend
    return NextResponse.json({
      ...data,
      activeClientsCount
    });
    
  } catch (error) {
    console.error("auth/me GET error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PUT /api/auth/me
export async function PUT(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await request.json();

  if (user.role === "client") {
    const updated = await prisma.client.update({
      where: { id: user.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.email && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone || null }),
      },
      select: { id: true, name: true, email: true, phone: true },
    });
    return NextResponse.json({ ...updated, role: "client" });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.email && { email: body.email }),
      ...(body.phone !== undefined && { phone: body.phone || null }),
    },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });

  return NextResponse.json(updated);
}