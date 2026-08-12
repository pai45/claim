"use client";

import Lottie from "lottie-react";
import { useEffect } from "react";
import { SUCCESS_COVER_MS } from "@/features/scan-pay/timing";
import tickAnimation from "./successTick.json";

/**
 * The interstitial between "processing payment" and the paid-to receipt: a green
 * circle pops in, the tick lands on it, then that same circle expands past the
 * viewport and hands off.
 *
 * The circle is CSS and the tick is Lottie, stacked in that order. Lottie clips
 * every layer to its own canvas, so it can never draw a shape big enough to cover
 * the screen — the expanding circle has to be a DOM element. Splitting them also
 * means only one green shape exists at a time.
 *
 * Owned by `PaymentCheckoutFlow` and rendered as a sibling of the current screen —
 * the screens are `overflow-hidden` and would clip the wipe, and the overlay has to
 * span the step swap so the swap itself is never visible.
 *
 * It is `pointer-events-none` for its whole life and the paid-to screen is mounted
 * and interactive underneath from the first frame, so a lost dismiss timer degrades
 * to a stuck veil over a working screen rather than a dead end.
 */
export function ScanPaySuccessTick({
  statusLabel,
  onCovered,
}: {
  statusLabel: string;
  /** Fired once the green fully covers the screen, to swap the step behind it. */
  onCovered: () => void;
}) {
  // The handoff runs on the CSS wipe's own clock, independent of the animation.
  useEffect(() => {
    const timer = window.setTimeout(onCovered, SUCCESS_COVER_MS);
    return () => window.clearTimeout(timer);
  }, [onCovered]);

  return (
    <div className="scan-pay-success-overlay">
      <div className="scan-pay-success-stage">
        <div className="scan-pay-success-veil" />
        {/* Order matters: the circle expands past the viewport, and the tick has to
            paint above it to stay visible while it grows. */}
        <div className="scan-pay-success-circle" />
        <div className="scan-pay-success-mark">
          <Lottie
            animationData={tickAnimation}
            loop={false}
            autoplay
            className="h-full w-full"
          />
        </div>
        <p className="sr-only" role="status">
          {statusLabel}
        </p>
      </div>
    </div>
  );
}
