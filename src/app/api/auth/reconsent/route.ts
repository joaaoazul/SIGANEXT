import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, getClientId } from "@/lib/auth";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { logAuditFromRequest } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rl = rateLimit(`reconsent:${ip}`, { max: 10, windowSecs: 60 * 60 });
    if (!rl.success) {
      return NextResponse.json({ error: "Demasiadas tentativas." }, { status: 429 });
    }

    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { version } = await request.json();
    if (!version) {
      return NextResponse.json({ error: "Versão obrigatória" }, { status: 400 });
    }

    const consentIp = getClientIP(request);
    const now = new Date();

    // Update User record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        consentDate: now,
        consentIp: consentIp || null,
        consentVersion: version,
      },
    });

    // Also update Client record if athlete
    if (user.role === "client") {
      try {
        const clientId = await getClientId(user);
        await prisma.client.update({
          where: { id: clientId },
          data: {
            consentDate: now,
            consentIp: consentIp || null,
            consentVersion: version,
          },
        });
      } catch {
        // client record may not exist
      }
    }

    logAuditFromRequest(request, "reconsent", {
      entity: "User",
      entityId: user.id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details: { version },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reconsent error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
