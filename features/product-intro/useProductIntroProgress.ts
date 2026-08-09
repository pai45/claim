"use client";

import { useCallback, useEffect, useState } from "react";
import {
  completeProductIntro,
  isProductIntroComplete,
  subscribeToProductIntro,
} from "./storage";

export function useProductIntroProgress() {
  const [completed, setCompleted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const refresh = useCallback(() => {
    setCompleted(isProductIntroComplete());
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      refresh();
      setIsHydrated(true);
    });
    const unsubscribe = subscribeToProductIntro(refresh);

    return () => {
      window.cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, [refresh]);

  const complete = useCallback(() => {
    // Advance this session even if managed/private storage rejects the write.
    setCompleted(true);
    completeProductIntro();
  }, []);

  return { completed, isHydrated, complete };
}
