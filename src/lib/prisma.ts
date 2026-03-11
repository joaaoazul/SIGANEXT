import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { logger } from "@/lib/logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!;

  // Configure connection pool for production scale (300-500 users)
  const pool = new pg.Pool({
    connectionString,
    max: 20, // Max connections in pool
    idleTimeoutMillis: 30_000, // Close idle connections after 30s
    connectionTimeoutMillis: 10_000, // Fail if can't connect in 10s
    allowExitOnIdle: true, // Allow process to exit when pool is idle
  });

  // Log pool errors to prevent unhandled rejections
  pool.on("error", (err) => {
    logger.exception("[PG Pool] Unexpected error on idle client", err);
  });

  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter });

  // Store pool reference for graceful shutdown
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
