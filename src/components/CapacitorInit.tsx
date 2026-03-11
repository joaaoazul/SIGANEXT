"use client";

import { useEffect } from "react";

/**
 * Initializes Capacitor native features when running inside iOS/Android shell.
 * Safe no-op on web. Add this component to the root layout.
 */
export function CapacitorInit() {
  useEffect(() => {
    import("@/lib/capacitor").then(({ initCapacitor }) => {
      initCapacitor();
    });
  }, []);

  return null;
}
