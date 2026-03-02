import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, getClientId } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { logAudit } from "@/lib/audit";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rl = rateLimit(`delete-account:${ip}`, { max: 3, windowSecs: 60 * 60 });
    if (!rl.success) {
      return NextResponse.json({ error: "Demasiadas tentativas. Tente mais tarde." }, { status: 429 });
    }

    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password obrigatória para confirmar eliminação." },
        { status: 400 }
      );
    }

    // Handle both PT (admin) and athlete (client) roles
    if (user.role === "client") {
      const clientId = await getClientId(user);
      const client = await prisma.client.findFirst({
        where: { id: clientId, deletedAt: null },
        select: { id: true, email: true, password: true },
      });

      if (!client || !client.password) {
        return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
      }

      const valid = await bcrypt.compare(password, client.password);
      if (!valid) {
        return NextResponse.json({ error: "Password incorreta" }, { status: 403 });
      }

      const anonymizedEmail = `deleted_${clientId}@anonimizado.local`;
      const anonymizedName = "[Dados Removidos]";

      await prisma.$transaction(async (tx) => {
        // RGPD Art. 17 — Anonymize all personal + health data
        await tx.client.update({
          where: { id: clientId },
          data: {
            deletedAt: new Date(),
            status: "inactive",
            name: anonymizedName,
            email: anonymizedEmail,
            phone: null,
            dateOfBirth: null,
            gender: null,
            avatar: null,
            notes: null,
            medicalConditions: null,
            medications: null,
            allergies: null,
            injuries: null,
            surgeries: null,
            familyHistory: null,
            bloodPressure: null,
            heartRate: null,
            occupation: null,
            smokingStatus: null,
            alcoholConsumption: null,
            dietaryRestrictions: null,
            foodAllergies: null,
            supplementsUsed: null,
            motivation: null,
            consentDate: null,
            consentIp: null,
            consentVersion: null,
          },
        });
        await tx.user.updateMany({
          where: { email: client.email, role: "client" },
          data: {
            role: "deleted_client",
            name: anonymizedName,
            email: anonymizedEmail,
            phone: null,
            bio: null,
            avatar: null,
          },
        });
      });
    } else {
      // PT / admin
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, password: true },
      });

      if (!dbUser) {
        return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
      }

      const valid = await bcrypt.compare(password, dbUser.password);
      if (!valid) {
        return NextResponse.json({ error: "Password incorreta" }, { status: 403 });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "deleted_admin",
          name: "[Dados Removidos]",
          email: `deleted_${user.id}@anonimizado.local`,
          phone: null,
          bio: null,
          avatar: null,
          coverImage: null,
          specialties: null,
          location: null,
          socialLinks: null,
          consentDate: null,
          consentIp: null,
          consentVersion: null,
        },
      });
    }

    logAudit({
      action: "delete_account",
      entity: user.role === "client" ? "Client" : "User",
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      ip: getClientIP(request) || undefined,
    });

    // Clear auth cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Erro ao eliminar conta" },
      { status: 500 }
    );
  }
}
