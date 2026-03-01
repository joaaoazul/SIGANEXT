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
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        bio: true,
        specialties: true,
        location: true,
        createdAt: true,
        updatedAt: true,
        consentDate: true,
        consentIp: true,
        _count: { select: { managedClients: true, bookingSlots: true } },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    return NextResponse.json(targetUser);
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

    // Only allow updating role and basic fields
    const data: Record<string, unknown> = {};
    if (body.role && ["admin", "superadmin", "employee", "client", "suspended"].includes(body.role)) {
      data.role = body.role;
    }
    if (body.name) data.name = body.name;

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });

    logAuditFromRequest(request, "admin_update_user", {
      entity: "User",
      entityId: id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details: { changes: data, targetEmail: updated.email },
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

    if (id === user.id) {
      return NextResponse.json({ error: "Não pode eliminar a própria conta" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id }, select: { email: true, role: true } });
    if (!target) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    // Suspend instead of delete (preserve data)
    await prisma.user.update({
      where: { id },
      data: { role: "suspended" },
    });

    logAuditFromRequest(request, "admin_suspend_user", {
      entity: "User",
      entityId: id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details: { targetEmail: target.email, previousRole: target.role },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
