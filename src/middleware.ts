import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "siga180-secret-key-change-in-production"
);

async function verifyTokenEdge(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/api/auth") || pathname.startsWith("/onboarding") || pathname.startsWith("/api/onboarding") || pathname.startsWith("/api/invites/validate")) {
    if (token && (await verifyTokenEdge(token)) && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!token || !(await verifyTokenEdge(token))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
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
    "/employees/:path*",
    "/settings/:path*",
    "/checkins/:path*",
    "/messages/:path*",
    "/onboarding",
    "/login",
    "/register",
  ],
};
