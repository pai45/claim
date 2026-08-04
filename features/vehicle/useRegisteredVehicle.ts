"use client";

import { useEffect, useState } from "react";
import {
  loadRegisteredVehicle,
  subscribeToRegisteredVehicle,
  type RegisteredVehicle,
} from "./registration";

export type UseRegisteredVehicle = {
  vehicle: RegisteredVehicle | null;
  /** False until the first client-side read, so callers can avoid a flash. */
  isHydrated: boolean;
};

/**
 * Reads the registered vehicle from localStorage after mount.
 *
 * The server render and the first client render both return
 * `{ vehicle: null, isHydrated: false }`, so the exported HTML matches — the
 * same shape `useChat` uses to restore a saved session. Deliberately not
 * `useSyncExternalStore`: `loadRegisteredVehicle` returns a fresh object on
 * every call, which would need a memoised snapshot to avoid a render loop.
 */
export function useRegisteredVehicle(): UseRegisteredVehicle {
  const [vehicle, setVehicle] = useState<RegisteredVehicle | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const read = () => setVehicle(loadRegisteredVehicle());
    const frame = window.requestAnimationFrame(() => {
      read();
      setIsHydrated(true);
    });
    const unsubscribe = subscribeToRegisteredVehicle(read);

    return () => {
      window.cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, []);

  return { vehicle, isHydrated };
}
