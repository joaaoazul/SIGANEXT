import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// GET - Get available contacts for athlete (PT + other athletes managed by same PT)
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user || user.role !== "client") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Get current client to find their manager
    const client = await prisma.client.findUnique({
      where: { id: user.id },
      select: { managerId: true },
    });

    const contacts: {
      id: string;
      name: string;
      avatar: string | null;
      type: "user" | "client";
      role: string;
    }[] = [];

    // Add PT (manager) as contact
    if (client?.managerId) {
      const pt = await prisma.user.findUnique({
        where: { id: client.managerId },
        select: { id: true, name: true, avatar: true },
      });
      if (pt) {
        contacts.push({
          id: pt.id,
          name: pt.name,
          avatar: pt.avatar,
          type: "user",
          role: "Personal Trainer",
        });
      }
    }

    // Add other athletes managed by the same PT
    if (client?.managerId) {
      const otherAthletes = await prisma.client.findMany({
        where: {
          managerId: client.managerId,
          id: { not: user.id },
          status: "active",
        },
        select: { id: true, name: true, avatar: true },
        orderBy: { name: "asc" },
      });

      for (const athlete of otherAthletes) {
        contacts.push({
          id: athlete.id,
          name: athlete.name,
          avatar: athlete.avatar,
          type: "client",
          role: "Atleta",
        });
      }
    }

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Athlete contacts GET error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
