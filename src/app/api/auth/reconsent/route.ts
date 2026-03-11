import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, getClientId } from "@/lib/auth";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { logAuditFromRequest } from "@/lib/audit";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rl = await rateLimit(`reconsent:${ip}`, { max: 10, windowSecs: 60 * 60 });
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

    const consentData = {
      consentDate: now,
      consentIp: consentIp || null,
      consentVersion: version,
    };

    if (user.role === "client") {
      // For clients, JWT id = Client.id, so use email to find+update User record
      await prisma.user.updateMany({
        where: { email: user.email },
        data: consentData,
      });

      // Also update Client record
      try {
        const clientId = await getClientId(user);
        await prisma.client.update({
          where: { id: clientId },
          data: consentData,
        });
      } catch {
        // client record may not exist
      }
    } else {
      // PT/Admin — update User record directly
      await prisma.user.update({
        where: { id: user.id },
        data: consentData,
      });
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
    logger.exception("Reconsent error", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
