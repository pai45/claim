"use client";

import { useEffect, useState } from "react";
import { isMpinSet, subscribeToMpin } from "./mpinStorage";

export type UseMpin = {
  isSet: boolean;
  /** False until the first client-side read, so callers can avoid a flash. */
  isHydrated: boolean;
};

/**
 * Reads whether an MPIN exists after mount. Mirrors `useAuthSession`: the server
 * render and the first client render both report `false`, so the exported HTML
 * matches.
 */
export function useMpin(): UseMpin {
  const [set, setSet] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const read = () => setSet(isMpinSet());
    const frame = window.requestAnimationFrame(() => {
      read();
      setIsHydrated(true);
    });
    const unsubscribe = subscribeToMpin(read);

    return () => {
      window.cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, []);

  return { isSet: set, isHydrated };
}
