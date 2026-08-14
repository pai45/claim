"use client";

import { useCallback, type RefObject } from "react";
import { ROHAN_EB_PLUS_SETUP_STEPS } from "@/features/walkthrough/steps";
import { useWalkthrough } from "@/features/walkthrough/useWalkthrough";
import {
  endIframeWalkthrough,
  measureIframeWalkthroughTarget,
} from "./iframeWalkthroughBridge";
import { WalkthroughOverlay } from "./WalkthroughOverlay";

type RohanEbPlusSetupWalkthroughProps = {
  frameRef: RefObject<HTMLIFrameElement | null>;
  /** Rohan's pending EB+ invitation on the unobstructed PlusPay home. */
  enabled: boolean;
  /** The iframe has loaded and received the active persona. */
  ready: boolean;
};

export function RohanEbPlusSetupWalkthrough({
  frameRef,
  enabled,
  ready,
}: RohanEbPlusSetupWalkthroughProps) {
  const measure = useCallback(
    (key: string) => measureIframeWalkthroughTarget(frameRef, key),
    [frameRef],
  );
  const onEnd = useCallback(
    () => endIframeWalkthrough(frameRef),
    [frameRef],
  );

  const controller = useWalkthrough({
    id: "rohan-eb-plus-setup",
    steps: ROHAN_EB_PLUS_SETUP_STEPS,
    enabled,
    ready,
    measure,
    onEnd,
  });

  if (controller.phase !== "running" || !controller.step) return null;

  return (
    <WalkthroughOverlay
      step={controller.step}
      stepIndex={controller.stepIndex}
      stepCount={controller.stepCount}
      rect={controller.rect}
      showHeader={false}
      onNext={controller.next}
      onBack={controller.back}
      onSkip={controller.skip}
      onTargetTap={controller.pause}
    />
  );
}
