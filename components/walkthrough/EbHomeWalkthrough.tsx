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
import { getEbHomeSteps } from "@/features/walkthrough/steps";
import type { WalkthroughRect } from "@/features/walkthrough/types";
import { useWalkthrough } from "@/features/walkthrough/useWalkthrough";
import { WalkthroughOverlay } from "./WalkthroughOverlay";

const MEASURE_MESSAGE = "employee-benefits:walkthrough-measure";
const RECT_MESSAGE = "employee-benefits:walkthrough-rect";
const TAPPED_MESSAGE = "employee-benefits:walkthrough-tapped";
const END_MESSAGE = "employee-benefits:walkthrough-end";
/** The iframe answers on the next frame; anything slower is a missing target. */
const MEASURE_TIMEOUT_MS = 600;

function subscribeToUpiCreated(listener: () => void): () => void {
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
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
    (key: string) =>
      new Promise<WalkthroughRect | null>((resolve) => {
        const frame = frameRef.current;
        const frameWindow = frame?.contentWindow;
        if (!frame || !frameWindow) {
          resolve(null);
          return;
        }

        const cleanup = () => {
          window.clearTimeout(timeout);
          window.removeEventListener("message", onMessage);
        };

        const onMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          if (event.source !== frameWindow) return;
          if (event.data?.type !== RECT_MESSAGE || event.data.key !== key) return;
          cleanup();
          if (!event.data.found) {
            resolve(null);
            return;
          }
          // The iframe measures against its own viewport; shift into host
          // coordinates so the overlay and the target agree.
          const offset = frame.getBoundingClientRect();
          const rect = event.data.rect as WalkthroughRect;
          resolve({
            top: rect.top + offset.top,
            left: rect.left + offset.left,
            width: rect.width,
            height: rect.height,
          });
        };

        const timeout = window.setTimeout(() => {
          cleanup();
          resolve(null);
        }, MEASURE_TIMEOUT_MS);

        window.addEventListener("message", onMessage);
        frameWindow.postMessage(
          { type: MEASURE_MESSAGE, key },
          window.location.origin,
        );
      }),
    [frameRef],
  );

  const onEnd = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage(
      { type: END_MESSAGE },
      window.location.origin,
    );
  }, [frameRef]);

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

  useEffect(() => {
    pauseRef.current = controller.pause;
  });

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type !== TAPPED_MESSAGE) return;
      pauseRef.current();
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
