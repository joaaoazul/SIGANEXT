"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * SWR-like data fetching hook with caching, auto-refetch, and mutation support.
 * Replaces the repetitive useState + useCallback + useEffect pattern across pages.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi<Client[]>("/api/clients");
 *   const { data, mutate } = useApi<Exercise[]>("/api/exercises?search=bench");
 */

interface UseApiOptions {
  /** Skip the initial fetch (for conditional fetching) */
  skip?: boolean;
  /** Auto-refetch interval in ms (0 = disabled) */
  refreshInterval?: number;
  /** Dependencies — re-fetches when these change */
  deps?: unknown[];
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Re-fetch the data */
  refetch: () => Promise<void>;
  /** Optimistically update local data without re-fetching */
  mutate: (data: T | ((prev: T | null) => T)) => void;
}

// Simple in-memory cache (shared across hook instances)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30_000; // 30 seconds

export function useApi<T = unknown>(
  url: string | null,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const { skip = false, refreshInterval = 0, deps = [] } = options;
  const [data, setData] = useState<T | null>(() => {
    if (!url) return null;
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T;
    }
    return null;
  });
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!url || skip) return;

    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erro ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      cache.set(url, { data: json, timestamp: Date.now() });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, skip, ...deps]);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (!refreshInterval || skip || !url) return;
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, fetchData, skip, url]);

  const mutate = useCallback(
    (updater: T | ((prev: T | null) => T)) => {
      setData((prev) => {
        const newData = typeof updater === "function"
          ? (updater as (prev: T | null) => T)(prev)
          : updater;
        if (url) cache.set(url, { data: newData, timestamp: Date.now() });
        return newData;
      });
    },
    [url]
  );

  return { data, loading, error, refetch: fetchData, mutate };
}

/**
 * Helper for POST/PUT/DELETE mutations.
 * Returns a function that performs the request and returns the response data.
 *
 * Usage:
 *   const createClient = useApiMutation<Client>("/api/clients", "POST");
 *   const result = await createClient({ name: "João", email: "..." });
 */
export function useApiMutation<T = unknown>(
  url: string,
  method: "POST" | "PUT" | "DELETE" | "PATCH" = "POST"
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (body?: unknown): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(url, {
          method,
          headers: body ? { "Content-Type": "application/json" } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Erro ${res.status}`);
        }

        const data = await res.json();
        return data as T;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [url, method]
  );

  return { execute, loading, error };
}
