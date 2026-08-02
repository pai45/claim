"use client";

import { useEffect, useState } from "react";

type UseRevealTextOptions = {
  text: string;
  enabled?: boolean;
  durationMs?: number;
};

/**
 * Progressively reveals assistant text for a short client-side "streaming" feel.
 * Instant when reduced-motion is preferred or when disabled.
 */
export function useRevealText({
  text,
  enabled = true,
  durationMs = 480,
}: UseRevealTextOptions) {
  const [visible, setVisible] = useState(() =>
    !enabled || text.length === 0 ? text : "",
  );
  const [done, setDone] = useState(() => !enabled || text.length === 0);

  useEffect(() => {
    if (!enabled || text.length === 0) {
      setVisible(text);
      setDone(true);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setVisible(text);
      setDone(true);
      return;
    }

    setVisible("");
    setDone(false);

    const started = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / durationMs);
      // Ease-out so early characters appear quickly
      const eased = 1 - (1 - t) * (1 - t);
      const count = Math.max(1, Math.ceil(text.length * eased));
      setVisible(text.slice(0, count));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setVisible(text);
        setDone(true);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, enabled, durationMs]);

  return { visible, done };
}
