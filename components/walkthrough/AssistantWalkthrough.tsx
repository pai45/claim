"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BENEFITS_ASSISTANT_SELECTORS,
  BENEFITS_ASSISTANT_STEPS,
} from "@/features/walkthrough/steps";
import type { WalkthroughRect } from "@/features/walkthrough/types";
import { useWalkthrough } from "@/features/walkthrough/useWalkthrough";
import { WalkthroughOverlay } from "./WalkthroughOverlay";

/**
 * The greeting animates in on a stagger, the composer landing last at 380ms
 * delay plus a 400ms `rise-in`. Measuring before that settles reports rects
 * mid-transform, so the walkthrough waits it out.
 */
const SETTLE_MS = 900;

type AssistantWalkthroughProps = {
  /** Persona and greeting-state gate. */
  enabled: boolean;
};

export function AssistantWalkthrough({ enabled }: AssistantWalkthroughProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const settle = (value: boolean) => setReady(value);
    if (!enabled) {
      settle(false);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      settle(true);
      return;
    }
    const timer = window.setTimeout(() => settle(true), SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [enabled]);

  const measure = useCallback(async (key: string): Promise<WalkthroughRect | null> => {
    const selector = BENEFITS_ASSISTANT_SELECTORS[key];
    if (!selector) return null;
    const target = document.querySelector<HTMLElement>(selector);
    if (!target || target.offsetParent === null) return null;
    target.scrollIntoView({ block: "nearest", behavior: "auto" });
    const { top, left, width, height } = target.getBoundingClientRect();
    return { top, left, width, height };
  }, []);

  const controller = useWalkthrough({
    id: "benefits-assistant",
    steps: BENEFITS_ASSISTANT_STEPS,
    enabled,
    ready,
    measure,
  });

  if (controller.phase !== "running" || !controller.step) return null;

  return (
    <WalkthroughOverlay
      step={controller.step}
      stepIndex={controller.stepIndex}
      stepCount={controller.stepCount}
      rect={controller.rect}
      onNext={controller.next}
      onBack={controller.back}
      onSkip={controller.skip}
      onTargetTap={controller.pause}
    />
  );
}
