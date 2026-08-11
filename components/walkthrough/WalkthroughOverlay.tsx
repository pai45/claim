"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { WalkthroughRect, WalkthroughStep } from "@/features/walkthrough/types";
import "./walkthrough.css";

/** Breathing room between the target's box and the spotlight ring. */
const SPOTLIGHT_PADDING = 6;
/** Gap between the spotlight and the caption card. */
const CARD_GAP = 14;
/** Clears the chat header, and the bottom nav with its floating button. */
const TOP_GUTTER = 76;
const BOTTOM_GUTTER = 139;

type Placement =
  | { edge: "below"; offset: number }
  | { edge: "above"; offset: number };

type Geometry = {
  top: number;
  left: number;
  width: number;
  height: number;
  placement: Placement;
};

type WalkthroughOverlayProps = {
  step: WalkthroughStep;
  stepIndex: number;
  stepCount: number;
  rect: WalkthroughRect | null;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  /** Called when the client taps the spotlit target, before the real handler runs. */
  onTargetTap: () => void;
};

export function WalkthroughOverlay({
  step,
  stepIndex,
  stepCount,
  rect,
  onNext,
  onBack,
  onSkip,
  onTargetTap,
}: WalkthroughOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const geometryRef = useRef<Geometry | null>(null);
  const onTargetTapRef = useRef(onTargetTap);
  const onSkipRef = useRef(onSkip);

  // Synced after commit, not during render — the readers are document-level
  // event handlers that only ever run once a render has landed.
  useEffect(() => {
    geometryRef.current = geometry;
    onTargetTapRef.current = onTargetTap;
    onSkipRef.current = onSkip;
  });

  // `rect` is viewport-relative, but at desktop widths `.desktop-mobile-frame`
  // has a transform and so becomes the containing block for our fixed root.
  // Subtracting the root's own origin makes the maths identical either way.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !rect) {
      setGeometry(null);
      return;
    }
    const origin = root.getBoundingClientRect();
    const top = rect.top - origin.top - SPOTLIGHT_PADDING;
    const left = rect.left - origin.left - SPOTLIGHT_PADDING;
    const width = rect.width + SPOTLIGHT_PADDING * 2;
    const height = rect.height + SPOTLIGHT_PADDING * 2;

    // Card goes under the target when it sits in the upper half, over it
    // otherwise, then gets clamped out of the header and nav gutters.
    const belowSpace = origin.height - (top + height) - CARD_GAP;
    const placement: Placement =
      top + height / 2 < origin.height * 0.55 && belowSpace > 180
        ? {
            edge: "below",
            offset: Math.min(
              top + height + CARD_GAP,
              origin.height - BOTTOM_GUTTER,
            ),
          }
        : {
            edge: "above",
            offset: Math.min(
              origin.height - top + CARD_GAP,
              origin.height - TOP_GUTTER,
            ),
          };

    setGeometry({ top, left, width, height, placement });
  }, [rect]);

  // Escape must be caught in the capture phase and stopped: the host closes the
  // whole Benefits Assistant from a `window` keydown listener, which would
  // otherwise fire too. Same workaround NewChatWidget uses.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      onSkipRef.current();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, []);

  // The spotlight is a real hole with nothing over it, so a tap there reaches
  // the app. Watching in the capture phase lets the walkthrough record its
  // place before the app's own handler runs — which for several targets
  // navigates the page away. `click` rather than `pointerdown`, so a drag or a
  // scroll that starts on the target does not count as a tap.
  // Targets inside the iframe never reach this document — the host wires those
  // up over postMessage instead.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const root = rootRef.current;
      const current = geometryRef.current;
      if (!root || !current) return;
      const origin = root.getBoundingClientRect();
      const x = event.clientX - origin.left;
      const y = event.clientY - origin.top;
      const inside =
        x >= current.left &&
        x <= current.left + current.width &&
        y >= current.top &&
        y <= current.top + current.height;
      if (inside) onTargetTapRef.current();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const swallow = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const isLast = stepIndex >= stepCount - 1;

  return (
    <div
      ref={rootRef}
      className="walkthrough-root"
      // Not `dialog`: the spotlit control stays outside this container and must
      // remain reachable, so claiming modality here would be a lie.
      role="group"
      aria-label="Feature walkthrough"
    >
      {geometry ? (
        <>
          <div
            className="walkthrough-scrim"
            onClick={swallow}
            style={{ top: 0, left: 0, right: 0, height: Math.max(0, geometry.top) }}
          />
          <div
            className="walkthrough-scrim"
            onClick={swallow}
            style={{
              top: geometry.top + geometry.height,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <div
            className="walkthrough-scrim"
            onClick={swallow}
            style={{
              top: geometry.top,
              left: 0,
              width: Math.max(0, geometry.left),
              height: geometry.height,
            }}
          />
          <div
            className="walkthrough-scrim"
            onClick={swallow}
            style={{
              top: geometry.top,
              left: geometry.left + geometry.width,
              right: 0,
              height: geometry.height,
            }}
          />

          <div
            className="walkthrough-spotlight"
            style={{
              top: geometry.top,
              left: geometry.left,
              width: geometry.width,
              height: geometry.height,
            }}
          />
        </>
      ) : null}

      <div
        className="walkthrough-card animate-rise-in"
        style={
          geometry?.placement.edge === "below"
            ? { top: geometry.placement.offset }
            : { bottom: geometry?.placement.offset ?? TOP_GUTTER }
        }
      >
        <div className="rounded-card bg-white p-5 shadow-menu">
          <div className="flex items-start justify-between gap-3">
            <p className="type-field-label">{step.eyebrow}</p>
            <button
              type="button"
              onClick={onSkip}
              className="-mr-1 -mt-1 shrink-0 rounded-pill px-2 py-1 text-caption font-bold text-ink-secondary"
            >
              Skip
            </button>
          </div>

          <h2 className="mt-1 type-section-title">{step.title}</h2>
          <p className="mt-1.5 type-body-secondary" aria-live="polite">
            {step.body}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="rounded-pill border border-input-border bg-white/95 px-3 py-1 text-caption font-bold text-pine">
              {stepIndex + 1} / {stepCount}
            </span>
            <div className="flex items-center gap-2">
              {stepIndex > 0 ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="min-h-11 rounded-control px-3 text-body-sm font-bold text-pine-primary"
                >
                  Back
                </button>
              ) : null}
              <button
                type="button"
                onClick={onNext}
                className="btn-primary h-auto min-h-11 px-5 py-2.5 text-body-sm"
              >
                {isLast ? "Done" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
