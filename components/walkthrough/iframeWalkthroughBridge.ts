import type { RefObject } from "react";
import type { WalkthroughRect } from "@/features/walkthrough/types";

export const WALKTHROUGH_TAPPED_MESSAGE =
  "employee-benefits:walkthrough-tapped";

const WALKTHROUGH_MEASURE_MESSAGE =
  "employee-benefits:walkthrough-measure";
const WALKTHROUGH_RECT_MESSAGE = "employee-benefits:walkthrough-rect";
const WALKTHROUGH_END_MESSAGE = "employee-benefits:walkthrough-end";
/** The iframe answers on the next frame; anything slower is a missing target. */
const MEASURE_TIMEOUT_MS = 600;

export function measureIframeWalkthroughTarget(
  frameRef: RefObject<HTMLIFrameElement | null>,
  key: string,
): Promise<WalkthroughRect | null> {
  return new Promise((resolve) => {
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
      if (
        event.data?.type !== WALKTHROUGH_RECT_MESSAGE ||
        event.data.key !== key
      ) {
        return;
      }
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
      { type: WALKTHROUGH_MEASURE_MESSAGE, key },
      window.location.origin,
    );
  });
}

export function endIframeWalkthrough(
  frameRef: RefObject<HTMLIFrameElement | null>,
): void {
  frameRef.current?.contentWindow?.postMessage(
    { type: WALKTHROUGH_END_MESSAGE },
    window.location.origin,
  );
}
