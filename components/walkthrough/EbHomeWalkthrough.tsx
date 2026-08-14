"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { UPI_CREATED_STORAGE_KEY } from "@/features/demo/reset";
import {
  EB_HOME_HOST_SELECTORS,
  EB_HOME_POST_UPI_STEP_INDEX,
  getEbHomeSteps,
} from "@/features/walkthrough/steps";
import { useWalkthrough } from "@/features/walkthrough/useWalkthrough";
import {
  endIframeWalkthrough,
  measureIframeWalkthroughTarget,
  WALKTHROUGH_TAPPED_MESSAGE,
} from "./iframeWalkthroughBridge";
import { WalkthroughOverlay } from "./WalkthroughOverlay";

const UPI_CREATED_MESSAGE = "employee-benefits:upi-created";
const UPI_CREATED_EVENT = "employee-benefits:upi-created-local";

function subscribeToUpiCreated(listener: () => void): () => void {
  window.addEventListener("storage", listener);
  window.addEventListener(UPI_CREATED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(UPI_CREATED_EVENT, listener);
  };
}

function readUpiCreated(): boolean {
  try {
    return window.localStorage.getItem(UPI_CREATED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

type EbHomeWalkthroughProps = {
  frameRef: RefObject<HTMLIFrameElement | null>;
  /** Persona and surface gate — false pauses a run in progress. */
  enabled: boolean;
  /** The iframe has loaded and been synced. */
  ready: boolean;
  hasBenefitsUpiId: boolean;
};

export function EbHomeWalkthrough({
  frameRef,
  enabled,
  ready,
  hasBenefitsUpiId,
}: EbHomeWalkthroughProps) {
  // Mirrors `hasUpiIdForMode` in the source app: a created UPI ID lives in
  // storage, so reading it here avoids waiting on the iframe's body class.
  const storedUpiCreated = useSyncExternalStore(
    subscribeToUpiCreated,
    readUpiCreated,
    () => false,
  );
  const upiCreated = hasBenefitsUpiId || storedUpiCreated;

  const steps = useMemo(() => getEbHomeSteps(upiCreated), [upiCreated]);

  const measure = useCallback(
    (key: string) => {
      const hostSelector = EB_HOME_HOST_SELECTORS[key];
      if (hostSelector) {
        // The previous target lived in the iframe. Release its scroll lock
        // before moving the spotlight onto the React-owned bottom navigation.
        endIframeWalkthrough(frameRef);
        const target = document.querySelector<HTMLElement>(hostSelector);
        if (!target || target.offsetParent === null) {
          return Promise.resolve(null);
        }
        const { top, left, width, height } = target.getBoundingClientRect();
        return Promise.resolve({ top, left, width, height });
      }

      return measureIframeWalkthroughTarget(frameRef, key);
    },
    [frameRef],
  );

  const onEnd = useCallback(
    () => endIframeWalkthrough(frameRef),
    [frameRef],
  );

  const controller = useWalkthrough({
    id: "eb-home",
    steps,
    enabled,
    ready,
    measure,
    onEnd,
  });

  // Pointer events never leave the iframe, so the tap-through that pauses a run
  // has to be reported across the bridge.
  const pauseRef = useRef(controller.pause);
  const queueResumeAtRef = useRef(controller.queueResumeAt);
  const phaseRef = useRef(controller.phase);
  const activeStepKeyRef = useRef(controller.step?.key ?? null);

  useEffect(() => {
    pauseRef.current = controller.pause;
    queueResumeAtRef.current = controller.queueResumeAt;
    phaseRef.current = controller.phase;
    activeStepKeyRef.current = controller.step?.key ?? null;
  });

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if (
        event.data?.type === WALKTHROUGH_TAPPED_MESSAGE &&
        phaseRef.current === "running" &&
        event.data.key === activeStepKeyRef.current
      ) {
        pauseRef.current();
        return;
      }
      if (event.data?.type === UPI_CREATED_MESSAGE) {
        // localStorage events can be inconsistent across embedded browsing
        // contexts. Refresh the snapshot explicitly and resume at step 6 once
        // the setup overlay returns to the home screen.
        window.dispatchEvent(new Event(UPI_CREATED_EVENT));
        queueResumeAtRef.current(EB_HOME_POST_UPI_STEP_INDEX);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [frameRef]);

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
