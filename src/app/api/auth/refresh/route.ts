import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error("JWT_SECRET environment variable is required");
const JWT_SECRET = new TextEncoder().encode(jwtSecret);

/**
 * POST /api/auth/refresh
 * Refreshes the JWT token if valid and within the last 2 days of its 7-day life.
 * Called automatically by the frontend to keep sessions alive.
 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Only refresh if token expires within the next 2 days
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = ((payload.exp as number) || 0) - now;
    const twoDays = 2 * 24 * 60 * 60;

    if (expiresIn > twoDays) {
      return NextResponse.json({ refreshed: false, message: "Token ainda válido" });
    }

    // Issue a new token
    const newToken = await new SignJWT({
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const response = NextResponse.json({ refreshed: true });
    response.cookies.set("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
