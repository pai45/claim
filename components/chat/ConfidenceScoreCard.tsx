"use client";

import { useEffect, useState } from "react";
import type { ConfidenceScorePayload } from "@/features/chat/types";
import { AUTO_APPROVAL_CONFIDENCE_THRESHOLD } from "@/lib/claims/autoApproval";
import { ScannedDocumentCard } from "./ScannedDocumentCard";

type ConfidenceScoreCardProps = {
  payload: ConfidenceScorePayload;
  createdAt: number;
};

/** Matches the freshness window MessageList uses to decide on text reveal. */
const FRESH_MS = 4000;
const COUNT_UP_MS = 900;

const RING_RADIUS = 26;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const VERDICT_COPY: Record<
  ConfidenceScorePayload["reason"],
  { headline: string; detail?: string }
> = {
  // Deliberately detail-free: the headline is the whole message.
  eligible: { headline: "Eligible for auto approval" },
  low_confidence: {
    headline: "Needs manual review",
    detail: `Confidence is below ${AUTO_APPROVAL_CONFIDENCE_THRESHOLD}%. HR will verify the details.`,
  },
  checks_failed: {
    headline: "Needs manual review",
    detail: "Some policy checks need attention before this can auto-approve.",
  },
  edited: {
    headline: "Needs manual review",
    detail: "The scanned details were changed, so HR will verify this claim.",
  },
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Eases 0 -> 1 so the number can tick up in step with the ring rather than
 * racing it. Shares the ease-out shape of `useRevealText`.
 *
 * Every write lands in a rAF callback, including the reduced-motion jump: the
 * settled value is the render-time default, so nothing has to be corrected
 * synchronously from inside the effect.
 */
function useCountUpProgress(enabled: boolean): number {
  const [progress, setProgress] = useState(() => (enabled ? 0 : 1));

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;

    if (prefersReducedMotion()) {
      frame = requestAnimationFrame(() => setProgress(1));
      return () => cancelAnimationFrame(frame);
    }

    const started = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / COUNT_UP_MS);
      setProgress(1 - (1 - t) * (1 - t));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled]);

  return progress;
}

function CheckGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path
        d="m2 5.1 1.8 1.8L8 2.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path
        d="M5 2.2v3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="5" cy="7.4" r="0.85" fill="currentColor" />
    </svg>
  );
}

export function ConfidenceScoreCard({
  payload,
  createdAt,
}: ConfidenceScoreCardProps) {
  // Read once on mount: a rehydrated transcript must land on the final state
  // instead of replaying the sweep every time the session is restored.
  const [animate] = useState(() => Date.now() - createdAt < FRESH_MS);
  const [swept, setSwept] = useState(!animate);
  const countUpProgress = useCountUpProgress(animate);
  const displayed = Math.round(payload.score * countUpProgress);
  const { headline, detail } = VERDICT_COPY[payload.reason];
  const eligible = payload.eligible;

  useEffect(() => {
    if (swept) return;
    // A frame's delay lets the browser paint the empty ring first, so the
    // transition has a start value to move away from.
    const frame = requestAnimationFrame(() => setSwept(true));
    return () => cancelAnimationFrame(frame);
  }, [swept]);

  const offset = swept
    ? RING_CIRCUMFERENCE * (1 - payload.score / 100)
    : RING_CIRCUMFERENCE;

  return (
    <article
      className="w-full rounded-card border border-border-line bg-white p-card shadow-card"
      role="status"
      aria-live="polite"
    >
      <ScannedDocumentCard complete embedded />

      <hr className="my-4 border-t border-border-line" />

      <div className="flex items-center gap-3">
        <span className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden>
            <circle
              cx="32"
              cy="32"
              r={RING_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              className="text-surface-tint"
            />
            <circle
              cx="32"
              cy="32"
              r={RING_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={offset}
              transform="rotate(-90 32 32)"
              className={`transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none ${
                eligible ? "text-success" : "text-warning-ink"
              }`}
            />
          </svg>
          <strong className="absolute text-body-sm font-bold text-pine tabular-nums">
            {displayed}%
          </strong>
        </span>
        <div className="min-w-0">
          <h3 className="text-body-sm font-bold text-pine">Confidence score</h3>
          <p className="type-body-secondary">
            How clearly the claim details were read
          </p>
        </div>
      </div>

      <div
        className={`animate-confidence-verdict mt-4 flex gap-2 rounded-control px-3 py-2.5 ${
          detail ? "items-start" : "items-center"
        } ${
          eligible
            ? "bg-success-soft text-success"
            : "bg-warning-tint text-warning-ink"
        }`}
        style={animate ? { animationDelay: "900ms" } : undefined}
      >
        <span className={`shrink-0 ${detail ? "mt-0.5" : ""}`}>
          {eligible ? <CheckGlyph /> : <AlertGlyph />}
        </span>
        <span className="min-w-0">
          <strong className="block text-body-sm font-bold">{headline}</strong>
          {detail ? (
            <span className="mt-0.5 block text-caption">{detail}</span>
          ) : null}
        </span>
      </div>
    </article>
  );
}
