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
      uptime: process.uptime(),
      version: process.env.npm_package_version || "unknown",
      checks: {
        database: {
          status: dbHealthy ? "up" : "down",
          latencyMs: dbLatencyMs,
        },
        memory: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
      },
      responseTimeMs: Date.now() - start,
    },
    { status: httpStatus }
  );
}
