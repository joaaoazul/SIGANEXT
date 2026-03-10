import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { logAuditFromRequest } from "@/lib/audit";
import { validatePassword } from "@/lib/schemas/password";

// PUT /api/auth/password
export async function PUT(request: NextRequest) {
  // Rate limit: 5 password change attempts per 15 minutes
  const ip = getClientIP(request);
  const rl = rateLimit(`password:${ip}`, { max: 5, windowSecs: 15 * 60 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Demasiadas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": Math.ceil((rl.resetAt - Date.now()) / 1000).toString() } }
    );
  }

  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Passwords obrigatórias" }, { status: 400 });
  }

  const pwValidation = validatePassword(newPassword);
  if (!pwValidation.valid) {
    return NextResponse.json({ error: pwValidation.errors[0] }, { status: 400 });
  }

  if (user.role === "client") {
    const dbClient = await prisma.client.findUnique({ where: { id: user.id } });
    if (!dbClient || !dbClient.password) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    const valid = await bcrypt.compare(currentPassword, dbClient.password);
    if (!valid) return NextResponse.json({ error: "Password atual incorreta" }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 12);
    const newVersion = (dbClient.tokenVersion ?? 0) + 1;
    await prisma.client.update({
      where: { id: user.id },
      data: { password: hashed, tokenVersion: newVersion },
    });

    logAuditFromRequest(request, "change_password", {
      entity: "User", userId: user.id, userEmail: user.email, userRole: user.role,
    });

    // Issue new token with updated version, invalidating all previous tokens
    const newToken = signToken({
      id: user.id, email: user.email, name: user.name, role: user.role,
      tokenVersion: newVersion,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, dbUser.password);
  if (!valid) return NextResponse.json({ error: "Password atual incorreta" }, { status: 400 });

  const hashed = await bcrypt.hash(newPassword, 12);
  const newVersion = (dbUser.tokenVersion ?? 0) + 1;
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, tokenVersion: newVersion },
  });

  logAuditFromRequest(request, "change_password", {
    entity: "User", userId: user.id, userEmail: user.email, userRole: user.role,
  });

  // Issue new token with updated version, invalidating all previous tokens
  const newToken = signToken({
    id: user.id, email: user.email, name: user.name, role: user.role,
    tokenVersion: newVersion,
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set("token", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
