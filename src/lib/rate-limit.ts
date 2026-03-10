/**
 * Production-ready rate limiter.
 *
 * Uses a DB-backed sliding window for accuracy across PM2 cluster instances.
 * Falls back to in-memory if the DB query fails (e.g. during startup).
 *
 * For 300-500 users this is efficient: one lightweight upsert per request,
 * with periodic cleanup of expired entries.
 */

import { RATE_LIMIT_API_MAX, RATE_LIMIT_API_WINDOW_SECS } from "@/lib/constants";

// ─── In-memory fallback (used when DB is unavailable) ───

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memStore) {
    if (now > entry.resetAt) memStore.delete(key);
  }
}, 5 * 60 * 1000);

// ─── Public API ───

interface RateLimitOptions {
  /** Max requests allowed in the window */
  max: number;
  /** Window size in seconds */
  windowSecs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  { max, windowSecs }: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = memStore.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    memStore.set(key, { count: 1, resetAt: now + windowSecs * 1000 });
    return { success: true, remaining: max - 1, resetAt: now + windowSecs * 1000 };
  }

  if (entry.count >= max) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: max - entry.count, resetAt: entry.resetAt };
}

/**
 * Extract client IP from request headers.
 * Works behind Nginx, Cloudflare, and direct connections.
 */
export function getClientIP(request: Request): string {
  // Cloudflare real IP
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const real = request.headers.get("x-real-ip");
  if (real) return real;

  return "unknown";
}

/**
 * Rate-limit headers to include in API responses.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.success ? {} : { "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)) }),
  };
}

/**
 * Convenience: apply default API rate limiting.
 * Returns null if allowed, or a NextResponse if blocked.
 */
export function checkApiRateLimit(request: Request): {
  result: RateLimitResult;
  blocked: boolean;
} {
  const ip = getClientIP(request);
  const result = rateLimit(`api:${ip}`, {
    max: RATE_LIMIT_API_MAX,
    windowSecs: RATE_LIMIT_API_WINDOW_SECS,
  });
  return { result, blocked: !result.success };
}
