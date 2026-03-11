import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { logAuditFromRequest } from "@/lib/audit";
import { normalizeEmail } from "@/lib/security";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 login attempts per 15 minutes per IP
    const ip = getClientIP(request);
    const rl = await rateLimit(`login:${ip}`, { max: 5, windowSecs: 15 * 60 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Demasiadas tentativas. Tente novamente mais tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rl.resetAt - Date.now()) / 1000).toString() } }
      );
    }

    const body = await request.json();
    const email = normalizeEmail(body.email);
    const { password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e password são obrigatórios" },
        { status: 400 }
      );
    }

    // Try User table first (trainers, admins, client-users)
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
      }

      // Block ALL suspended accounts — consent-withdrawn users must be reactivated by admin
      if (user.role === "suspended") {
        let isConsentWithdrawal = false;
        try {
          const perms = JSON.parse(user.permissions || "{}");
          if (perms.previousRole) isConsentWithdrawal = true;
        } catch { /* ignore */ }

        return NextResponse.json(
          { error: isConsentWithdrawal
              ? "O seu consentimento foi revogado. A sua conta está suspensa. Contacte o suporte para reativar."
              : "A sua conta está suspensa. Contacte o suporte para mais informações."
          },
          { status: 403 }
        );
      }

      // For client-role users, resolve the Client record so we use Client.id
      // (all athlete APIs key data by clientId, not userId)
      let tokenId = user.id;
      let tokenVersion = user.tokenVersion ?? 0;
      if (user.role === "client") {
        const client = await prisma.client.findUnique({ where: { email } });
        if (client) {
          tokenId = client.id;
          // CRITICAL: Use Client.tokenVersion because getUser() checks Client table for athletes
          tokenVersion = client.tokenVersion ?? 0;
        }
      }

      const token = signToken({
        id: tokenId,
        email: user.email,
        name: user.name,
        role: user.role,
        tokenVersion,
      });

      const response = NextResponse.json({
        user: { id: tokenId, email: user.email, name: user.name, role: user.role },
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 4 * 60 * 60,
        path: "/",
      });

      logAuditFromRequest(request, "login", {
        entity: "User",
        entityId: user.id,
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
      });

      return response;
    }

    // Fallback: check Client table directly (athletes without User record)
    const client = await prisma.client.findUnique({ where: { email } });

    if (!client || !client.password) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const isValidClient = await bcrypt.compare(password, client.password);
    if (!isValidClient) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const token = signToken({
      id: client.id,
      email: client.email,
      name: client.name,
      role: "client",
      tokenVersion: client.tokenVersion ?? 0,
    });

    const response = NextResponse.json({
      user: { id: client.id, email: client.email, name: client.name, role: "client" },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 4 * 60 * 60,
      path: "/",
    });

    logAuditFromRequest(request, "login", {
      entity: "Client",
      entityId: client.id,
      userId: client.id,
      userEmail: client.email,
      userRole: "client",
    });

    return response;
  } catch (error: unknown) {
    const fullMsg = error instanceof Error ? error.message : String(error);
    logger.error("Login error", { detail: fullMsg });
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
