"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isOnboardingComplete,
  loadOnboardingState,
  subscribeToOnboarding,
} from "./storage";

export function useOnboardingProgress() {
  const [completed, setCompleted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const refresh = useCallback(() => {
    setCompleted(isOnboardingComplete());
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      refresh();
      setIsHydrated(true);
    });
    const unsubscribe = subscribeToOnboarding(refresh);
    return () => {
      window.cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, [refresh]);

  return {
    completed,
    isHydrated,
    state: isHydrated ? loadOnboardingState() : null,
  };
}
