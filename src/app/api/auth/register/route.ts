import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { logAuditFromRequest } from "@/lib/audit";
import { validatePassword } from "@/lib/schemas/password";
import { normalizeEmail } from "@/lib/security";
import { CURRENT_POLICY_VERSION } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 registration attempts per hour per IP
    const ip = getClientIP(request);
    const rl = rateLimit(`register:${ip}`, { max: 3, windowSecs: 60 * 60 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Demasiadas tentativas. Tente novamente mais tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rl.resetAt - Date.now()) / 1000).toString() } }
      );
    }

    const body = await request.json();
    const email = normalizeEmail(body.email);
    const { password, name, consent, healthConsent } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    // Validate password strength
    const pwValidation = validatePassword(password);
    if (!pwValidation.valid) {
      return NextResponse.json({ error: pwValidation.errors[0] }, { status: 400 });
    }

    if (!consent) {
      return NextResponse.json(
        { error: "Tem de aceitar a Política de Privacidade para se registar." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email já registado" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const consentIp = getClientIP(request);

    // Security: first registered user becomes admin, subsequent users default to 'employee'
    // and require admin approval/promotion for elevated roles
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "admin" : "employee";

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name.trim(),
        role,
        tokenVersion: 0,
        consentDate: new Date(),
        consentIp: consentIp || null,
        consentVersion: CURRENT_POLICY_VERSION,
        healthDataConsent: !!healthConsent,
      },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tokenVersion: 0,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    logAuditFromRequest(request, "register", {
      entity: "User",
      entityId: user.id,
      userId: user.id,
      userEmail: user.email,
      userRole: role,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
