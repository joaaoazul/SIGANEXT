import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Validate an invite code
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code } = body;

  if (!code) return NextResponse.json({ error: "Código é obrigatório" }, { status: 400 });

  const invite = await prisma.invite.findUnique({ where: { code } });

  if (!invite) {
    return NextResponse.json({ error: "Código de convite inválido" }, { status: 404 });
  }

  if (invite.status !== "pending") {
    return NextResponse.json({ error: "Este convite já foi utilizado ou expirou" }, { status: 400 });
  }

  if (new Date() > invite.expiresAt) {
    await prisma.invite.update({ where: { id: invite.id }, data: { status: "expired" } });
    return NextResponse.json({ error: "Este convite expirou" }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    email: invite.email,
    inviteId: invite.id,
  });
}
