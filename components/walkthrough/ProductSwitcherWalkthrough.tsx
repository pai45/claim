"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { PRODUCT_SWITCHER_STEPS } from "@/features/walkthrough/steps";
import { useWalkthrough } from "@/features/walkthrough/useWalkthrough";
import {
  endIframeWalkthrough,
  measureIframeWalkthroughTarget,
} from "./iframeWalkthroughBridge";
import { WalkthroughOverlay } from "./WalkthroughOverlay";

type ProductSwitcherWalkthroughProps = {
  frameRef: RefObject<HTMLIFrameElement | null>;
  /** Rohan's activated account and unobstructed home-surface gate. */
  enabled: boolean;
  /** A fresh run starts on EB+, then remains enabled across both products. */
  startEnabled: boolean;
  /** The iframe has loaded and been synced. */
  ready: boolean;
  plusPayMode: boolean;
};

export function shouldAdvanceProductSwitcher(
  stepIndex: number,
  previousPlusPayMode: boolean,
  plusPayMode: boolean,
): boolean {
  if (stepIndex === 0) return !previousPlusPayMode && plusPayMode;
  if (stepIndex === 1) return previousPlusPayMode && !plusPayMode;
  return false;
}

export function ProductSwitcherWalkthrough({
  frameRef,
  enabled,
  startEnabled,
  ready,
  plusPayMode,
}: ProductSwitcherWalkthroughProps) {
  const measure = useCallback(
    (key: string) => measureIframeWalkthroughTarget(frameRef, key),
    [frameRef],
  );
  const onEnd = useCallback(
    () => endIframeWalkthrough(frameRef),
    [frameRef],
  );
  const ignoreHostTargetTap = useCallback(() => {}, []);

  const controller = useWalkthrough({
    id: "product-switcher",
    steps: PRODUCT_SWITCHER_STEPS,
    enabled,
    startEnabled,
    ready,
    measure,
    onEnd,
  });
  const { next, phase, stepIndex } = controller;

  const previousPlusPayModeRef = useRef(plusPayMode);

  useEffect(() => {
    const previousPlusPayMode = previousPlusPayModeRef.current;
    previousPlusPayModeRef.current = plusPayMode;
    if (phase !== "running") return;
    if (
      shouldAdvanceProductSwitcher(
        stepIndex,
        previousPlusPayMode,
        plusPayMode,
      )
    ) {
      next();
    }
  }, [next, phase, plusPayMode, stepIndex]);

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
      // The target is inside the iframe; successful mode changes above are
      // the source of truth for advancement.
      onTargetTap={ignoreHostTargetTap}
    />
  );
}
