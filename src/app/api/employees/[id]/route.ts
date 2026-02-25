import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

// PUT /api/employees/:id
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Apenas administradores" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.email) data.email = body.email;
  if (body.phone !== undefined) data.phone = body.phone || null;
  if (body.password) data.password = await bcrypt.hash(body.password, 10);
  if (body.permissions !== undefined) data.permissions = body.permissions ? JSON.stringify(body.permissions) : null;

  const employee = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true, email: true, name: true, role: true,
      phone: true, permissions: true, createdAt: true,
    },
  });

  return NextResponse.json(employee);
}

// DELETE /api/employees/:id
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Apenas administradores" }, { status: 403 });

  const { id } = await params;
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
