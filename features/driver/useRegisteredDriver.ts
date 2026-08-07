"use client";

import { useEffect, useState } from "react";
import {
  loadRegisteredDriver,
  subscribeToRegisteredDriver,
  type RegisteredDriver,
} from "./registration";

export type UseRegisteredDriver = {
  driver: RegisteredDriver | null;
  /** False until the first client-side read, so callers can avoid a flash. */
  isHydrated: boolean;
};

/** Reads the registered driver and tracks same-tab and cross-tab updates. */
export function useRegisteredDriver(): UseRegisteredDriver {
  const [driver, setDriver] = useState<RegisteredDriver | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const read = () => setDriver(loadRegisteredDriver());
    const frame = window.requestAnimationFrame(() => {
      read();
      setIsHydrated(true);
    });
    const unsubscribe = subscribeToRegisteredDriver(read);

    return () => {
      window.cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, []);

  return { driver, isHydrated };
}
