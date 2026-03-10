/**
 * Simple in-memory TTL cache for production.
 *
 * Used to avoid hitting the DB on every request for data that
 * rarely changes (e.g. admin stats, compliance scores).
 *
 * Not shared across PM2 instances — each process has its own cache.
 * This is acceptable because the data is read-only aggregates.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

// Periodically clean expired cache entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now > entry.expiresAt) cache.delete(key);
  }
}, 10 * 60 * 1000);

/**
 * Get or compute a cached value.
 *
 * @param key - Unique cache key
 * @param ttlSecs - Time-to-live in seconds
 * @param compute - Async function to compute the value if not cached
 */
export async function cached<T>(
  key: string,
  ttlSecs: number,
  compute: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const existing = cache.get(key) as CacheEntry<T> | undefined;

  if (existing && now < existing.expiresAt) {
    return existing.data;
  }

  const data = await compute();
  cache.set(key, { data, expiresAt: now + ttlSecs * 1000 });
  return data;
}

/**
 * Invalidate a specific cache key or all keys matching a prefix.
 */
export function invalidateCache(keyOrPrefix: string): void {
  if (cache.has(keyOrPrefix)) {
    cache.delete(keyOrPrefix);
    return;
  }
  // Prefix-based invalidation
  for (const key of cache.keys()) {
    if (key.startsWith(keyOrPrefix)) cache.delete(key);
  }
}

/**
 * Clear the entire cache.
 */
export function clearCache(): void {
  cache.clear();
}
