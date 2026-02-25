import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e password são obrigatórios" },
        { status: 400 }
      );
    }

    // Try User table first (trainers, admins)
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
      }

      const token = signToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      const response = NextResponse.json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
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

    // Fallback: check Client table (athletes)
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
