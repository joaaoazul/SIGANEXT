import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { logAuditFromRequest } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user || user.role !== "superadmin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const status = url.searchParams.get("status") || "";
    const severity = url.searchParams.get("severity") || "";
    const category = url.searchParams.get("category") || "";

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (category) where.category = category;

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        include: {
          notes: {
            orderBy: { createdAt: "desc" },
            take: 3,
          },
          _count: { select: { notes: true } },
        },
        orderBy: [
          { status: "asc" },
          { severity: "asc" },
          { createdAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.incident.count({ where }),
    ]);

    return NextResponse.json({
      incidents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin incidents error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user || user.role !== "superadmin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, severity, category, reportedBy, metadata } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Título e descrição são obrigatórios" }, { status: 400 });
    }

    const incident = await prisma.incident.create({
      data: {
        title,
        description,
        severity: severity || "medium",
        category: category || "other",
        reportedBy: reportedBy || user.email,
        assignedTo: user.id,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    logAuditFromRequest(request, "create_incident", {
      entity: "Incident",
      entityId: incident.id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details: { title, severity: incident.severity, category: incident.category },
    });

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error("Create incident error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
