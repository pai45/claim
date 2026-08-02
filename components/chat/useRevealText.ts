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
  const instant = !enabled || text.length === 0;
  const [visible, setVisible] = useState(() => (instant ? text : ""));
  const [done, setDone] = useState(() => instant);
  const [source, setSource] = useState({ text, enabled });

  // Reset reveal state when inputs change (render-time adjustment).
  if (source.text !== text || source.enabled !== enabled) {
    setSource({ text, enabled });
    setVisible(instant ? text : "");
    setDone(instant);
  }

  useEffect(() => {
    if (instant || done) return;

    let frame = 0;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const finish = () => {
      setVisible(text);
      setDone(true);
    };

    if (media.matches) {
      frame = requestAnimationFrame(finish);
      return () => cancelAnimationFrame(frame);
    }

    const started = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / durationMs);
      // Ease-out so early characters appear quickly
      const eased = 1 - (1 - t) * (1 - t);
      const count = Math.max(1, Math.ceil(text.length * eased));
      setVisible(text.slice(0, count));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        finish();
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, enabled, durationMs, instant, done]);

  return { visible, done };
}
