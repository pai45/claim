"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearPausedStep,
  hasSeenWalkthrough,
  markWalkthroughSeen,
  readPausedStep,
  writePausedStep,
} from "./storage";
import type {
  WalkthroughId,
  WalkthroughPhase,
  WalkthroughRect,
  WalkthroughStep,
} from "./types";

type UseWalkthroughOptions = {
  id: WalkthroughId;
  steps: WalkthroughStep[];
  /** Persona and surface gate. Turning this off mid-run pauses the walkthrough. */
  enabled: boolean;
  /**
   * Optional stricter gate for a brand-new run. Once running, only `enabled`
   * controls pausing so a target action can legitimately change this value.
   */
  startEnabled?: boolean;
  /** The surface has settled enough for `getBoundingClientRect` to be truthful. */
  ready: boolean;
  /**
   * Resolves the spotlight box for a step, or null when the target is absent.
   * Must be stable — wrap it in `useCallback`.
   */
  measure: (key: string) => Promise<WalkthroughRect | null>;
  /** Runs when the walkthrough stops for any reason. Used to unlock scroll. */
  onEnd?: () => void;
};

export type WalkthroughController = {
  phase: WalkthroughPhase;
  step: WalkthroughStep | null;
  stepIndex: number;
  stepCount: number;
  rect: WalkthroughRect | null;
  next: () => void;
  back: () => void;
  skip: () => void;
  /** Records the current step and steps aside so a real tap can go through. */
  pause: () => void;
  /** Queues a specific step to appear when the current surface closes. */
  queueResumeAt: (stepIndex: number) => void;
};

type WalkthroughStartGate = {
  phase: WalkthroughPhase;
  enabled: boolean;
  startEnabled: boolean;
  ready: boolean;
  stepCount: number;
  resumeArmed: boolean;
};

export function canStartWalkthrough({
  phase,
  enabled,
  startEnabled,
  ready,
  stepCount,
  resumeArmed,
}: WalkthroughStartGate): boolean {
  if (!enabled || !ready || stepCount === 0) return false;
  if (phase === "idle") return startEnabled;
  return phase === "paused" && resumeArmed;
}

export function useWalkthrough({
  id,
  steps,
  enabled,
  startEnabled = enabled,
  ready,
  measure,
  onEnd,
}: UseWalkthroughOptions): WalkthroughController {
  const [phase, setPhase] = useState<WalkthroughPhase>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<WalkthroughRect | null>(null);

  const measureRef = useRef(measure);
  const onEndRef = useRef(onEnd);
  const stepIndexRef = useRef(stepIndex);
  const phaseRef = useRef(phase);
  /** A paused run resumes only after its target surface actually went away. */
  const resumeArmedRef = useRef(false);
  /** Guards the skip-missing-target path against looping through every step. */
  const missesRef = useRef(0);

  // Mirrored after commit rather than during render. Every reader is an event
  // handler or an async continuation, so they always see the committed value.
  useEffect(() => {
    measureRef.current = measure;
    onEndRef.current = onEnd;
    stepIndexRef.current = stepIndex;
    phaseRef.current = phase;
  });

  const stop = useCallback(
    (nextPhase: "done" | "paused") => {
      if (nextPhase === "done") {
        markWalkthroughSeen(id);
        clearPausedStep(id);
        resumeArmedRef.current = false;
      } else {
        writePausedStep(id, stepIndexRef.current);
      }
      setPhase(nextPhase);
      setRect(null);
      onEndRef.current?.();
    },
    [id],
  );

  // Auto-start once, or resume after the surface opened by a tap-through has
  // closed. A fresh mount can resume from session storage; a mounted paused run
  // first has to observe `enabled === false`, which prevents an overlay flash
  // while the tapped surface is still opening.
  useEffect(() => {
    if (
      !canStartWalkthrough({
        phase,
        enabled,
        startEnabled,
        ready,
        stepCount: steps.length,
        resumeArmed: resumeArmedRef.current,
      })
    ) {
      return;
    }
    const start = () => {
      const paused = readPausedStep(id);
      if (paused === null && hasSeenWalkthrough(id)) return;
      missesRef.current = 0;
      resumeArmedRef.current = false;
      // The step list is rebuilt from live state on every start, so a resume
      // index captured against a shorter list has to be clamped.
      setStepIndex(paused === null ? 0 : Math.min(paused, steps.length - 1));
      setPhase("running");
    };
    start();
  }, [enabled, id, phase, ready, startEnabled, steps.length]);

  // Losing the surface mid-run (nav away, product switch) is a pause, not a
  // stop. A target tap may already have paused the controller, so arm both
  // states for a resume when the surface becomes available again.
  useEffect(() => {
    if (enabled || (phase !== "running" && phase !== "paused")) return;
    resumeArmedRef.current = true;
    if (phase === "running") {
      const pauseNow = () => stop("paused");
      pauseNow();
    }
  }, [enabled, phase, stop]);

  const next = useCallback(() => {
    if (stepIndexRef.current >= steps.length - 1) {
      stop("done");
      return;
    }
    missesRef.current = 0;
    setRect(null);
    setStepIndex((index) => index + 1);
  }, [steps.length, stop]);

  const back = useCallback(() => {
    missesRef.current = 0;
    setRect(null);
    setStepIndex((index) => Math.max(0, index - 1));
  }, []);

  const skip = useCallback(() => stop("done"), [stop]);
  const pause = useCallback(() => stop("paused"), [stop]);
  const queueResumeAt = useCallback(
    (nextStepIndex: number) => {
      const normalizedIndex = Math.max(0, Math.trunc(nextStepIndex));
      // Keep the ref and persisted value ahead of any overlapping surface-loss
      // effect, which would otherwise write the old step back into storage.
      stepIndexRef.current = normalizedIndex;
      writePausedStep(id, normalizedIndex);
      setStepIndex(normalizedIndex);
      setRect(null);
      setPhase("paused");
    },
    [id],
  );

  // Measure the active step. A target that is missing or hidden is skipped
  // rather than spotlit as an empty box — the safety net for layout that
  // reflows with `is-upi-created`.
  useEffect(() => {
    if (phase !== "running") return;
    const step = steps[stepIndex];
    if (!step) return;

    let cancelled = false;

    const run = async () => {
      const measured = await measureRef.current(step.key);
      if (cancelled || phaseRef.current !== "running") return;
      if (measured && measured.width > 0 && measured.height > 0) {
        missesRef.current = 0;
        setRect(measured);
        return;
      }
      missesRef.current += 1;
      if (missesRef.current >= steps.length) {
        stop("done");
        return;
      }
      if (stepIndex >= steps.length - 1) stop("done");
      else setStepIndex((index) => index + 1);
    };

    void run();

    const remeasure = () => {
      void measureRef.current(step.key).then((measured) => {
        if (cancelled || phaseRef.current !== "running") return;
        if (measured && measured.width > 0) setRect(measured);
      });
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") remeasure();
    };

    window.addEventListener("resize", remeasure);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", remeasure);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [phase, stepIndex, steps, stop]);

  return {
    phase,
    step: phase === "running" ? (steps[stepIndex] ?? null) : null,
    stepIndex,
    stepCount: steps.length,
    rect,
    next,
    back,
    skip,
    pause,
    queueResumeAt,
  };
}
