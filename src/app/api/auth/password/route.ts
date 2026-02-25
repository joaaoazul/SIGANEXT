import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

// PUT /api/auth/password
export async function PUT(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Passwords obrigatórias" }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: "A nova password deve ter pelo menos 6 caracteres" }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, dbUser.password);
  if (!valid) return NextResponse.json({ error: "Password atual incorreta" }, { status: 400 });

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  return NextResponse.json({ success: true });
}
