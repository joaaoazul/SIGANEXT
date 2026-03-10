/**
 * Security utilities for input validation and sanitization.
 * Prevents XSS, path traversal, injection attacks.
 */
import crypto from "crypto";

// ─── Path Traversal Prevention ──────────────────────────────────────────────

/**
 * Validate and sanitize a file path to prevent path traversal attacks.
 * Returns null if the path is invalid/malicious.
 */
export function sanitizeFilePath(path: string): string | null {
  if (!path || typeof path !== "string") return null;

  // Block path traversal patterns
  if (
    path.includes("..") ||
    path.startsWith("/") ||
    path.startsWith("\\") ||
    path.includes("\0") ||  // null byte injection
    path.includes("%2e") || // URL-encoded dots
    path.includes("%2f") || // URL-encoded slashes
    path.includes("%5c")    // URL-encoded backslashes
  ) {
    return null;
  }

  // Only allow alphanumeric, hyphens, underscores, dots, and forward slashes
  if (!/^[a-zA-Z0-9/_\-. ]+$/.test(path)) {
    return null;
  }

  return path;
}

/**
 * Validate that an upload folder matches expected patterns.
 * Prevents arbitrary file placement in storage buckets.
 */
export function validateUploadFolder(folder: string): boolean {
  if (!folder || typeof folder !== "string") return false;

  // Allowed patterns — must cover all folder values used in the frontend:
  // - clients/{cuid}/assessments
  // - clients/{cuid}/checkins
  // - clients/{cuid}/photos
  // - clients/{cuid}/avatar
  // - profile/{cuid}
  // - profiles/{cuid}
  // - onboarding/{cuid}
  // - food-logs/{date}
  const validPatterns = [
    /^clients\/[a-zA-Z0-9_-]+\/(assessments|checkins|photos|avatar)$/,
    /^profiles?\/[a-zA-Z0-9_-]+$/,
    /^onboarding\/[a-zA-Z0-9_-]+$/,
    /^food-logs\/[a-zA-Z0-9_-]+$/,
  ];

  return validPatterns.some((pattern) => pattern.test(folder));
}

// ─── Cryptographically Secure Random ────────────────────────────────────────

/**
 * Generate a cryptographically secure random password.
 * Uses crypto.randomBytes instead of Math.random().
 */
export function generateSecurePassword(length = 12): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
  const randomBytes = crypto.randomBytes(length);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(randomBytes[i] % chars.length);
  }
  return password;
}

// ─── Input Sanitization ─────────────────────────────────────────────────────

/**
 * Sanitize a string for safe use in Content-Disposition headers.
 * Removes all characters except alphanumerics, hyphens, and underscores.
 */
export function sanitizeFilename(name: string): string {
  if (!name || typeof name !== "string") return "export";
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-zA-Z0-9\-_]/g, "")
    .toLowerCase()
    .slice(0, 100) || "export";
}

/**
 * Normalize an email address for consistent lookups.
 * Trims whitespace and converts to lowercase.
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

/**
 * Validate an email format (basic check).
 */
export function isValidEmail(email: string): boolean {
  // RFC 5322 simplified — covers 99%+ of valid emails
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

// ─── Pagination ─────────────────────────────────────────────────────────────

/** Cap pagination limit to prevent excessive database load */
export function safePaginationLimit(limit: number, maxLimit = 200): number {
  const parsed = Number.isFinite(limit) ? limit : 50;
  return Math.max(1, Math.min(parsed, maxLimit));
}

// ─── Error Handling ─────────────────────────────────────────────────────────

/**
 * Create a safe error response that never leaks internal details in production.
 */
export function safeErrorResponse(
  message: string,
  status: number,
  error?: unknown
): Response {
  if (process.env.NODE_ENV !== "production" && error) {
    const details =
      error instanceof Error ? error.message : String(error);
    return Response.json({ error: message, debug: details }, { status });
  }
  return Response.json({ error: message }, { status });
}

// ─── XSS Prevention ────────────────────────────────────────────────────────

/**
 * Strip HTML tags from a string to prevent stored XSS.
 * Use on user-provided text fields that don't need HTML.
 */
export function stripHtml(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "")        // Remove HTML tags
    .replace(/javascript:/gi, "")   // Remove javascript: URIs
    .replace(/on\w+=/gi, "")        // Remove inline event handlers
    .replace(/data:/gi, "d_ata:")   // Neutralize data: URIs in text
    .trim();
}

/**
 * Validate that a URL is safe (no javascript: or data: protocols).
 */
export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const lower = url.trim().toLowerCase();
  if (lower.startsWith("javascript:")) return false;
  if (lower.startsWith("data:") && !lower.startsWith("data:image/")) return false;
  if (lower.startsWith("vbscript:")) return false;
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    // Relative URLs are OK
    return !lower.includes(":");
  }
}
