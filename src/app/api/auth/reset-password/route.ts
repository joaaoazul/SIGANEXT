import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { validatePassword } from "@/lib/schemas/password";
import { normalizeEmail } from "@/lib/security";
import { logAuditFromRequest } from "@/lib/audit";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/reset-password
 * Validates the reset token and sets a new password.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 attempts per 15 minutes per IP
    const ip = getClientIP(request);
    const rl = await rateLimit(`reset-pwd:${ip}`, { max: 5, windowSecs: 15 * 60 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Demasiadas tentativas. Tente novamente mais tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rl.resetAt - Date.now()) / 1000).toString() } }
      );
    }

    const body = await request.json();
    const email = normalizeEmail(body.email);
    const token = body.token;
    const newPassword = body.newPassword;

    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Validate password strength
    const passwordResult = validatePassword(newPassword);
    if (!passwordResult.valid) {
      return NextResponse.json(
        { error: passwordResult.errors[0] || "Password inválida" },
        { status: 400 }
      );
    }

    // Find valid (unused, not expired) reset tokens for this email
    const resetTokens = await prisma.passwordResetToken.findMany({
      where: {
        email,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    if (resetTokens.length === 0) {
      return NextResponse.json(
        { error: "Link de recuperação inválido ou expirado." },
        { status: 400 }
      );
    }

    // Verify token hash against any valid token
    let matchedTokenId: string | null = null;
    for (const rt of resetTokens) {
      const isMatch = await bcrypt.compare(token, rt.tokenHash);
      if (isMatch) {
        matchedTokenId = rt.id;
        break;
      }
    }

    if (!matchedTokenId) {
      return NextResponse.json(
        { error: "Link de recuperação inválido ou expirado." },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and invalidate token in a transaction
    await prisma.$transaction(async (tx) => {
      // Mark token as used
      await tx.passwordResetToken.update({
        where: { id: matchedTokenId },
        data: { usedAt: new Date() },
      });

      // Update User password + increment tokenVersion
      await tx.user.updateMany({
        where: { email },
        data: {
          password: hashedPassword,
          tokenVersion: { increment: 1 },
        },
      });

      // Sync to Client record if it exists (dual-record architecture)
      await tx.client.updateMany({
        where: { email },
        data: {
          password: hashedPassword,
          tokenVersion: { increment: 1 },
        },
      });
    });

    logAuditFromRequest(request, "password_reset", {
      entity: "User",
      userEmail: email,
      details: { method: "self_service_reset" },
    });

    return NextResponse.json({ message: "Password alterada com sucesso." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
