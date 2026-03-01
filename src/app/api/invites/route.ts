import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import crypto from "crypto";
import { sendInviteEmail } from "@/lib/email";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
  type: z.enum(["magic_code", "magic_link"]).optional().default("magic_code"),
});

// POST - Create invite
export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const raw = await request.json();
  const result = inviteSchema.safeParse(raw);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }
  const { email, type } = result.data;

  // Generate code (6-digit for magic_code, uuid for magic_link)
  const code = type === "magic_code"
    ? crypto.randomInt(100000, 999999).toString()
    : crypto.randomUUID().replace(/-/g, "").slice(0, 24);

  // Expire in 7 days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Invalidate previous pending invites for this email
  await prisma.invite.updateMany({
    where: { email, status: "pending" },
    data: { status: "expired" },
  });

  const invite = await prisma.invite.create({
    data: {
      email,
      code,
      type,
      invitedBy: user.id,
      expiresAt,
    },
  });

  // Build the magic link URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const magicLink = `${baseUrl}/onboarding?code=${invite.code}`;

  // Send invite email via Resend (non-blocking)
  let emailSent = false;
  try {
    await sendInviteEmail({
      to: email,
      trainerName: user.name,
      code: invite.code,
      type: type as "magic_code" | "magic_link",
      magicLink,
    });
    emailSent = true;
  } catch (emailErr) {
    console.error("Invite email failed:", emailErr);
  }

  return NextResponse.json({
    invite,
    code: invite.code,
    magicLink,
    emailSent,
    message: type === "magic_code"
      ? `Código de convite: ${invite.code}`
      : `Link de convite: ${magicLink}`,
  });
}

// GET - List invites
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const invites = await prisma.invite.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(invites);
}
