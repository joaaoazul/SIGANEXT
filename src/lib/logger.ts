/**
 * Structured logging utility for production.
 *
 * Outputs JSON logs for easy ingestion by log aggregators (CloudWatch, Datadog, etc.).
 * Falls back to human-readable format in development.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

const IS_PRODUCTION = process.env.NODE_ENV === "production";

function formatLog(entry: LogEntry): string {
  if (IS_PRODUCTION) {
    return JSON.stringify(entry);
  }
  // Human-readable format for development
  const { level, message, timestamp, ...rest } = entry;
  const extra = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : "";
  return `[${timestamp}] ${level.toUpperCase()} ${message}${extra}`;
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  const formatted = formatLog(entry);

  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "debug":
      if (!IS_PRODUCTION) console.debug(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),

  /**
   * Log an HTTP request context (useful in API routes).
   */
  request: (
    method: string,
    path: string,
    meta?: Record<string, unknown>
  ) => log("info", `${method} ${path}`, { type: "request", ...meta }),

  /**
   * Log an error with stack trace.
   */
  exception: (message: string, error: unknown, meta?: Record<string, unknown>) => {
    const err = error instanceof Error ? error : new Error(String(error));
    log("error", message, {
      error: err.message,
      stack: err.stack,
      ...meta,
    });
  },
};
