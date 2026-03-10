/**
 * Application-wide constants.
 * Centralised to avoid mismatches between components and API routes.
 */

/** Current RGPD / privacy-policy version — bump when policy changes */
export const CURRENT_POLICY_VERSION = "2.0";

/** Password requirements */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/** Rate-limit defaults */
export const RATE_LIMIT_LOGIN_MAX = 5;
export const RATE_LIMIT_LOGIN_WINDOW_SECS = 15 * 60; // 15 minutes

export const RATE_LIMIT_API_MAX = 100;
export const RATE_LIMIT_API_WINDOW_SECS = 60; // 1 minute

/** File upload limits */
export const MAX_UPLOAD_SIZE_MB = 10;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
] as const;

/** JWT / auth */
export const JWT_EXPIRY = "7d";
export const JWT_REFRESH_THRESHOLD_SECS = 2 * 24 * 60 * 60; // 2 days

/** Data retention */
export const DATA_RETENTION_DAYS = 730; // 2 years
export const AUDIT_LOG_RETENTION_DAYS = 365; // 1 year
