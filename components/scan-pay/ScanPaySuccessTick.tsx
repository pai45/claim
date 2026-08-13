"use client";

import { useEffect } from "react";
import { SUCCESS_COVER_MS } from "@/features/scan-pay/timing";

/**
 * The interstitial between "processing payment" and the paid-to receipt: a green
 * circle pops in, the tick lands on it, then that same circle expands past the
 * viewport and hands off.
 *
 * Every part of it is CSS on one 1.3s `linear` timeline. That is deliberate: the
 * tick used to be a Lottie, which runs its own rAF loop independent of the CSS
 * clock. On a throttled device the full-screen `clip-path` animation fell behind
 * while the small SVG kept full speed, so the tick reached full size while the
 * circle was still tiny and its ends visibly overhung the green. Sharing a clock
 * means that if frames drop, everything drops together.
 *
 * `.scan-pay-success-mark` also carries the *same* clip-path animation as the
 * circle, so the tick is clipped to the circle's silhouette at every frame. Even
 * if the two ever did drift, the tick could not render outside the green.
 *
 * Owned by `PaymentCheckoutFlow` and rendered as a sibling of the current screen —
 * the screens are `overflow-hidden` and would clip the expansion, and the overlay
 * has to span the step swap so the swap itself is never visible.
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
  useEffect(() => {
    const timer = window.setTimeout(onCovered, SUCCESS_COVER_MS);
    return () => window.clearTimeout(timer);
  }, [onCovered]);

  return (
    <div className="scan-pay-success-overlay">
      <div className="scan-pay-success-stage">
        <div className="scan-pay-success-veil" />
        <span className="scan-pay-success-halo" />
        <div className="scan-pay-success-circle" />
        {/* Clipped to the same circle, and painted above it so the tick stays
            visible while the green grows out past it. */}
        <div className="scan-pay-success-mark">
          <svg
            className="scan-pay-success-tick"
            viewBox="0 0 104 104"
            fill="none"
            stroke="#fff"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M35.5 53.5 L46.5 64.5 L68.5 39.5" />
          </svg>
        </div>
        <p className="sr-only" role="status">
          {statusLabel}
        </p>
      </div>
    </div>
  );
}
