import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, getClientId } from "@/lib/auth";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { logAuditFromRequest } from "@/lib/audit";

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

    // For clients, JWT id = Client.id (not User.id), so use email to find User
    if (user.role === "client") {
      // Check if User record is suspended due to consent withdrawal
      const userRecord = await prisma.user.findFirst({
        where: { email: user.email },
        select: { id: true, role: true, permissions: true },
      });

      if (userRecord) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {
          consentDate: now,
          consentIp: consentIp || null,
          consentVersion: version,
        };

        // Restore role if suspended due to consent withdrawal
        if (userRecord.role === "suspended") {
          let previousRole = "client";
          try {
            const perms = JSON.parse(userRecord.permissions || "{}");
            if (perms.previousRole) previousRole = perms.previousRole;
          } catch { /* ignore */ }
          updateData.role = previousRole;
          updateData.permissions = null;
        }

        await prisma.user.update({
          where: { id: userRecord.id },
          data: updateData,
        });
      }

      // Update Client record and restore status if inactive
      try {
        const clientId = await getClientId(user);
        const clientRecord = await prisma.client.findUnique({
          where: { id: clientId },
          select: { status: true },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clientData: any = {
          consentDate: now,
          consentIp: consentIp || null,
          consentVersion: version,
        };

        // Restore active status if was deactivated by consent withdrawal
        if (clientRecord?.status === "inactive") {
          clientData.status = "active";
        }

        await prisma.client.update({
          where: { id: clientId },
          data: clientData,
        });
      } catch {
        // client record may not exist
      }
    } else {
      // PT/Admin — update User record directly (user.id = User.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        consentDate: now,
        consentIp: consentIp || null,
        consentVersion: version,
      };

      // Restore role if suspended due to consent withdrawal
      const userRecord = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true, permissions: true },
      });

      if (userRecord?.role === "suspended") {
        let previousRole = "employee";
        try {
          const perms = JSON.parse(userRecord.permissions || "{}");
          if (perms.previousRole) previousRole = perms.previousRole;
        } catch { /* ignore */ }
        updateData.role = previousRole;
        updateData.permissions = null;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
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
    console.error("Reconsent error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
