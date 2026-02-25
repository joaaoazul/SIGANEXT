import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET /api/employees
export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Apenas administradores" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  const where: Record<string, unknown> = { role: "employee" };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const employees = await prisma.user.findMany({
    where,
    select: {
      id: true, email: true, name: true, role: true,
      avatar: true, phone: true, permissions: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(employees);
}

// POST /api/employees - create employee
export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Apenas administradores" }, { status: 403 });

  const body = await request.json();
  const { name, email, password, phone, permissions } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Nome, email e password são obrigatórios" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email já existe" }, { status: 400 });

  const hashedPassword = await bcrypt.hash(password, 10);

  const employee = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "employee",
      phone: phone || null,
      permissions: permissions ? JSON.stringify(permissions) : null,
    },
    select: {
      id: true, email: true, name: true, role: true,
      phone: true, permissions: true, createdAt: true,
    },
  });

  return NextResponse.json(employee, { status: 201 });
}
