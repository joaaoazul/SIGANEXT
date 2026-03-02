import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { logAuditFromRequest } from "@/lib/audit";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

/**
 * POST /api/auth/withdraw-consent — Withdraw RGPD consent
 * This revokes consent without fully deleting the account.
 * Sets role to "suspended" and clears consent fields.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rl = rateLimit(`withdraw:${ip}`, { max: 3, windowSecs: 60 * 60 });
    if (!rl.success) {
      return NextResponse.json({ error: "Demasiadas tentativas. Tente mais tarde." }, { status: 429 });
    }

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const { confirmation } = await request.json();

    if (confirmation !== "REVOGAR CONSENTIMENTO") {
      return NextResponse.json(
        { error: "Confirmação inválida. Escreva 'REVOGAR CONSENTIMENTO' para confirmar." },
        { status: 400 }
      );
    }

    const role = payload.role as string;

    if (role === "client" || role === "deleted_client") {
      // Athlete — suspend and clear consent
      const client = await prisma.client.findUnique({
        where: { id: payload.id as string },
      });

      if (!client) {
        return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
      }

      await prisma.client.update({
        where: { id: client.id },
        data: {
          status: "inactive",
          consentDate: null,
          consentIp: null,
          consentVersion: null,
        },
      });

      // Also suspend the associated User record
      await prisma.user.updateMany({
        where: { email: client.email },
        data: {
          role: "suspended",
          consentDate: null,
          consentIp: null,
          consentVersion: null,
        },
      });

      await logAuditFromRequest(request, "withdraw_consent", {
        entity: "Client",
        entityId: client.id,
        details: { email: client.email, type: "athlete" },
      });
    } else {
      // PT/Admin — suspend and clear consent
      const user = await prisma.user.findUnique({
        where: { id: payload.id as string },
      });

      if (!user) {
        return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "suspended",
          consentDate: null,
          consentIp: null,
          consentVersion: null,
        },
      });

      await logAuditFromRequest(request, "withdraw_consent", {
        entity: "User",
        entityId: user.id,
        details: { email: user.email, type: "pt" },
      });
    }

    // Clear auth cookie
    const response = NextResponse.json({
      message: "Consentimento revogado com sucesso. A sua conta foi suspensa.",
    });
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Withdraw consent error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
