import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { logAuditFromRequest } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user || user.role !== "superadmin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        notes: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!incident) {
      return NextResponse.json({ error: "Incidente não encontrado" }, { status: 404 });
    }

    return NextResponse.json(incident);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user || user.role !== "superadmin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.title) data.title = body.title;
    if (body.description) data.description = body.description;
    if (body.severity) data.severity = body.severity;
    if (body.status) {
      data.status = body.status;
      if (body.status === "resolved" || body.status === "closed") {
        data.resolvedAt = new Date();
      }
    }
    if (body.category) data.category = body.category;
    if (body.assignedTo !== undefined) data.assignedTo = body.assignedTo;
    if (body.resolution !== undefined) data.resolution = body.resolution;

    // If adding a note alongside the update
    if (body.note) {
      await prisma.incidentNote.create({
        data: {
          incidentId: id,
          authorId: user.id,
          authorName: user.name,
          content: body.note,
        },
      });
    }

    const updated = await prisma.incident.update({
      where: { id },
      data,
      include: {
        notes: { orderBy: { createdAt: "asc" } },
      },
    });

    logAuditFromRequest(request, "update_incident", {
      entity: "Incident",
      entityId: id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details: { changes: data, newStatus: updated.status },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user || user.role !== "superadmin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.incident.delete({ where: { id } });

    logAuditFromRequest(request, "delete_incident", {
      entity: "Incident",
      entityId: id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
