import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { sendPasswordResetLinkEmail } from "@/lib/email";
import { normalizeEmail } from "@/lib/security";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * POST /api/auth/forgot-password
 * Sends a password reset link via email.
 * Always returns 200 to prevent email enumeration.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 requests per 15 minutes per IP
    const ip = getClientIP(request);
    const rl = await rateLimit(`forgot-pwd:${ip}`, { max: 3, windowSecs: 15 * 60 });
    if (!rl.success) {
      return NextResponse.json(
        { message: "Se o email existir, receberás um link de recuperação." },
        { status: 200 }
      );
    }

    const body = await request.json();
    const email = normalizeEmail(body.email);
    if (!email) {
      return NextResponse.json(
        { message: "Se o email existir, receberás um link de recuperação." },
        { status: 200 }
      );
    }

    // Look up user (try User table first, then Client-only)
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user || user.role === "suspended") {
      // Same response to prevent enumeration
      return NextResponse.json(
        { message: "Se o email existir, receberás um link de recuperação." },
        { status: 200 }
      );
    }

    // Invalidate any existing unused tokens for this email
    await prisma.passwordResetToken.updateMany({
      where: { email, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Generate cryptographically secure token
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(rawToken, 10);

    // Store hashed token with 1-hour expiry
    await prisma.passwordResetToken.create({
      data: {
        email,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Build reset URL
    const resetUrl = `${APP_URL}/login?reset=${rawToken}&email=${encodeURIComponent(email)}`;

    // Send email (fire and forget — don't block response)
    sendPasswordResetLinkEmail({
      to: email,
      recipientName: user.name,
      resetUrl,
    }).catch((err) => {
      console.error("Failed to send password reset email:", err);
    });

    return NextResponse.json(
      { message: "Se o email existir, receberás um link de recuperação." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Se o email existir, receberás um link de recuperação." },
      { status: 200 }
    );
  }
}
