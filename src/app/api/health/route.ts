import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/health — Application health check
 *
 * Returns current application status for monitoring systems
 * (UptimeRobot, Cloudflare Health Checks, load balancers, etc.)
 */
export async function GET() {
  const start = Date.now();
  let dbHealthy = false;
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbHealthy = true;
  } catch {
    dbHealthy = false;
  }

  const status = dbHealthy ? "healthy" : "degraded";
  const httpStatus = dbHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: dbHealthy ? "up" : "down",
          latencyMs: dbLatencyMs,
        },
      },
    },
    { status: httpStatus }
  );
}
