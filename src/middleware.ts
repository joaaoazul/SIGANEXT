import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error("JWT_SECRET environment variable is required");
const JWT_SECRET = new TextEncoder().encode(jwtSecret);

interface TokenPayload {
  id: string;
  role: string;
}

async function getTokenPayload(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { id: payload.id as string, role: payload.role as string };
  } catch {
    return null;
  }
}

// PT-only routes (athlete cannot access)
const PT_ROUTES = [
  "/clients", "/exercises", "/foods",
  "/checkins", "/feedback", "/notifications",
];

// Athlete-only routes (PT cannot access)
const ATHLETE_ROUTES = ["/athlete"];

// System admin routes (superadmin only)
const ADMIN_ROUTES = ["/admin"];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // ── CSRF Protection for mutating API requests ──
  // Verify Origin header matches our domain for state-changing requests
  if (
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth/login") &&
    !pathname.startsWith("/api/auth/register") &&
    !pathname.startsWith("/api/onboarding") &&
    !pathname.startsWith("/api/invites/validate") &&
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    request.method !== "OPTIONS"
  ) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json(
            { error: "CSRF: Origin mismatch" },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "CSRF: Invalid origin" },
          { status: 403 }
        );
      }
    } else {
      // Deny mutating API requests without Origin header
      // Modern browsers always send Origin on fetch/XHR; absence is suspicious
      return NextResponse.json(
        { error: "CSRF: Missing origin" },
        { status: 403 }
      );
    }
  }

  // Public routes
  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/api/onboarding") ||
    pathname.startsWith("/api/invites/validate") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/cookies") ||
    pathname.startsWith("/termos") ||
    pathname.startsWith("/dpia") ||
    pathname.startsWith("/dpa") ||
    pathname.startsWith("/violacao-dados") ||
    pathname.startsWith("/offline");

  if (isPublic) {
    if (token && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
      const user = await getTokenPayload(token);
      if (user) {
        const dest = user.role === "client" ? "/athlete" : "/dashboard";
        return NextResponse.redirect(new URL(dest, request.url));
      }
    }
    return NextResponse.next();
  }

  // Protected routes — must be authenticated
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const user = await getTokenPayload(token);
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based routing
  const isAthleteRoute = ATHLETE_ROUTES.some((r) => pathname.startsWith(r));
  const isPtRoute = PT_ROUTES.some((r) => pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  // System admin routes — admin (PT) or superadmin only
  if (isAdminRoute && user.role !== "admin" && user.role !== "superadmin") {
    const dest = user.role === "client" ? "/athlete" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  let response = NextResponse.next();

  // Auto-refresh token if it expires within 2 days
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = ((payload.exp as number) || 0) - now;
    const thirtyMin = 30 * 60;
    if (expiresIn > 0 && expiresIn < thirtyMin) {
      // Re-sign token (import jose's SignJWT for edge-compatible signing)
      const newToken = await new (await import("jose")).SignJWT({
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        tokenVersion: payload.tokenVersion ?? 0,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("4h")
        .sign(JWT_SECRET);

      response = NextResponse.next();
      response.cookies.set("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 4 * 60 * 60,
        path: "/",
      });
    }
  } catch { /* token refresh is best-effort */ }

  if (user.role === "client") {
    // Athletes accessing PT-only routes → redirect to athlete area
    if (isPtRoute) {
      return NextResponse.redirect(new URL("/athlete", request.url));
    }
    // Athletes accessing /dashboard → redirect to athlete dashboard
    if (pathname === "/dashboard") {
      return NextResponse.redirect(new URL("/athlete", request.url));
    }
  } else {
    // PT/admin accessing athlete-only routes → redirect to PT dashboard
    if (isAthleteRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    // API routes (excluding public auth, health, invites, onboarding, files)
    "/api/((?!auth|health|invites/validate|onboarding|files).*)",
    "/dashboard/:path*",
    "/clients/:path*",
    "/exercises/:path*",
    "/training/:path*",
    "/nutrition/:path*",
    "/foods/:path*",
    "/feedback/:path*",
    "/bookings/:path*",
    "/notifications/:path*",
    "/content/:path*",
    "/settings/:path*",
    "/checkins/:path*",
    "/messages/:path*",
    "/profile/:path*",
    "/athlete/:path*",
    "/admin/:path*",
    "/onboarding",
    "/login",
    "/register",
  ],
};
