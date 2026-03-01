import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 login attempts per 15 minutes per IP
    const ip = getClientIP(request);
    const rl = rateLimit(`login:${ip}`, { max: 5, windowSecs: 15 * 60 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Demasiadas tentativas. Tente novamente mais tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rl.resetAt - Date.now()) / 1000).toString() } }
      );
    }

    const { email, password } = await request.json();

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

      // For client-role users, resolve the Client record so we use Client.id
      // (all athlete APIs key data by clientId, not userId)
      let tokenId = user.id;
      if (user.role === "client") {
        const client = await prisma.client.findUnique({ where: { email } });
        if (client) tokenId = client.id;
      }

      const token = signToken({
        id: tokenId,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      const response = NextResponse.json({
        user: { id: tokenId, email: user.email, name: user.name, role: user.role },
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
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
    });

    const response = NextResponse.json({
      user: { id: client.id, email: client.email, name: client.name, role: "client" },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
