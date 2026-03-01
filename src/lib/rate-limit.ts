/**
 * Simple in-memory rate limiter for serverless environments.
 * Tracks requests per IP with a sliding window.
 * Good enough for 20-30 athletes; for larger scale, use Redis (e.g. @upstash/ratelimit).
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

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
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowSecs * 1000 });
    return { success: true, remaining: max - 1, resetAt: now + windowSecs * 1000 };
  }

  if (entry.count >= max) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: max - entry.count, resetAt: entry.resetAt };
}

/**
 * Extract client IP from request headers (works on Vercel).
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
