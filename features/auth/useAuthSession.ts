"use client";

import { useEffect, useState } from "react";
import {
  loadAuthSession,
  subscribeToAuthSession,
  type AuthSession,
} from "./session";

export type UseAuthSession = {
  session: AuthSession | null;
  /** False until the first client-side read, so callers can avoid a flash. */
  isHydrated: boolean;
};

/**
 * Reads the signed-in session from localStorage after mount.
 *
 * The server render and the first client render both return
 * `{ session: null, isHydrated: false }`, so the exported HTML matches — the
 * same shape `useRegisteredVehicle` uses. Deliberately not `useSyncExternalStore`:
 * `loadAuthSession` returns a fresh object on every call, which would need a
 * memoised snapshot to avoid a render loop.
 */
export function useAuthSession(): UseAuthSession {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const read = () => setSession(loadAuthSession());
    const frame = window.requestAnimationFrame(() => {
      read();
      setIsHydrated(true);
    });
    const unsubscribe = subscribeToAuthSession(read);

    return () => {
      window.cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, []);

  return { session, isHydrated };
}
