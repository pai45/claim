"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { AppIcon } from "@/components/shared/AppIcon";
import { UI_ICONS } from "@/lib/ui/assets";
import {
  DEFAULT_WIDGET_POSITION,
  loadWidgetPosition,
  saveWidgetPosition,
  type WidgetSide,
} from "@/features/chat/widgetPosition";

type NewChatWidgetProps = {
  /**
   * Clears the thread outright. The drawer's own options step *is* the
   * confirmation, so this must not be ChatShell's `requestClear` — routing
   * through the dialog again would ask the same question twice.
   */
  onClearChat: () => void;
  /** Opens the shared bill-draft bottom sheet for an eligible conversation. */
  onRequestDraftDecision?: () => void;
  hasEligibleBillDrafts?: boolean;
  /**
   * Id of the newest completed-claim turn, or null when the thread has none.
   * Every *change* to a non-null value pops the drawer open for {@link HOLD_MS}.
   * A restored session therefore stays quiet: the value is already current on
   * the first render, so there is nothing to change.
   */
  completedClaimKey: string | null;
  /** Already computed by ChatShell for the ColorBends backdrop. */
  reduceMotion: boolean;
};

/**
 * The drawer is one box that morphs through three sizes rather than three
 * components that swap, so `width`/`height`/`border-radius` can carry the whole
 * transition on a single easing curve.
 *
 * - `handle`  a slim tab tucked against the wall, mostly hidden
 * - `cta`     the "New chat" pill, wiped in from the wall
 * - `options` "Clear chat" / "Keep chatting" for non-bill conversations
 */
type Stage = "handle" | "cta" | "options";

/** Tab footprint. {@link HANDLE_PEEK} of the width hangs past the wall. */
const HANDLE_W = 34;
const HANDLE_H = 56;
/**
 * How far the tab sits past the frame, clipped by the chat frame's own
 * `overflow-hidden`. 12 of 34 hidden leaves a 22px sliver — deliberately slim,
 * which is why {@link PAD_W} supplies the real touch target.
 */
const HANDLE_PEEK = 12;
/** Transparent grab area over the tab, sized for a fingertip. */
const PAD_W = 48;
/** Diameter of the puck the tab becomes while it is being dragged. */
const DRAG_SIZE = HANDLE_H;
/**
 * Expanded sizes are fixed constants rather than `auto` so the box can animate
 * at all — and, on the right wall, so `left` and `width` share one curve. Both
 * then interpolate between known endpoints, which keeps the wall-side edge
 * pinned for the whole transition instead of chasing a width still being
 * measured.
 */
const CTA_W = 152;
const CTA_H = HANDLE_H;
/** 10 padding + 16 title + 6 + 40 + 6 + 40 + 10. */
const OPTIONS_W = 216;
const OPTIONS_H = 128;

const STAGE_BOX: Record<Stage, { width: number; height: number }> = {
  handle: { width: HANDLE_W, height: HANDLE_H },
  cta: { width: CTA_W, height: CTA_H },
  options: { width: OPTIONS_W, height: OPTIONS_H },
};

/** Inset from the wall once open — matches `--spacing-page`. */
const INSET = 16;
/** Clears the 69px header with a little air. */
const TOP_GUTTER = 76;
/** Reserves the composer's band so the drawer can never sit on the input. */
const BOTTOM_GUTTER = 104;
/** Movement past this many px is a drag, not a tap. */
const DRAG_THRESHOLD = 6;
const HOLD_MS = 5000;
const DURATION_MS = 360;
const FADE_MS = 200;
const EASE = "cubic-bezier(0.22,1,0.36,1)";

type Placement = {
  side: WidgetSide;
  top: number;
  layerWidth: number;
  layerHeight: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * The px range `yRatio` maps onto. Sized for `boxHeight`, so opening the tall
 * options panel near the floor slides it up to fit rather than letting it run
 * under the composer.
 */
function bandFor(layerHeight: number, boxHeight: number) {
  const min = TOP_GUTTER;
  return { min, max: Math.max(min, layerHeight - BOTTOM_GUTTER - boxHeight) };
}

export function NewChatWidget({
  onClearChat,
  onRequestDraftDecision,
  hasEligibleBillDrafts = false,
  completedClaimKey,
  reduceMotion,
}: NewChatWidgetProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  // Placement is published from callbacks (the resize observer, the drag
  // handlers) while the refs below stay the authoritative, synchronously
  // readable copy the gesture math needs.
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [dragLeft, setDragLeft] = useState<number | null>(null);
  const [stage, setStage] = useState<Stage>("handle");
  const [seenClaimKey, setSeenClaimKey] = useState(completedClaimKey);

  const sideRef = useRef<WidgetSide>(DEFAULT_WIDGET_POSITION.side);
  const yRatioRef = useRef(DEFAULT_WIDGET_POSITION.yRatio);
  const holdTimerRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  // Written synchronously on every move; the painted copy lags a frame behind,
  // and pointerup has to settle on the finger's real last position.
  const latestRef = useRef({ left: 0, top: 0 });
  // A drag ends with a native `click`. This suppresses it so releasing the
  // drawer somewhere new does not also trip whichever button is under the
  // finger.
  const draggedRef = useRef(false);
  const activePointerRef = useRef<number | null>(null);
  const originRef = useRef({ pointerX: 0, pointerY: 0, left: 0, top: 0 });
  // The window listeners a live gesture installed, or null between gestures.
  const gestureCleanupRef = useRef<(() => void) | null>(null);
  // The drag math reads the frame's measurements from a native listener, which
  // closes over whatever render installed it. A mirror keeps that read current
  // without re-binding the listener on every drag frame.
  const placementRef = useRef<Placement | null>(null);

  // React's "adjust state when a prop changes" pattern. An effect would be the
  // obvious home for this, but setting state straight from an effect body costs
  // a second render pass with a paint in between — here that paint would show
  // the tab for a frame before it opens.
  if (completedClaimKey !== seenClaimKey) {
    setSeenClaimKey(completedClaimKey);
    // Never over the options step: the user is mid-decision there, and yanking
    // the panel back to the pill would discard the question they were answering.
    if (completedClaimKey) {
      setStage((current) => (current === "options" ? current : "cta"));
    }
  }

  // `h-dvh` shrinks when the soft keyboard opens, which would otherwise leave
  // the drawer floating over the composer or clipped out of view entirely.
  // ResizeObserver fires once on observe(), so this doubles as the mount
  // measurement — no separate synchronous pass needed.
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const saved = loadWidgetPosition();
    if (saved) {
      sideRef.current = saved.side;
      yRatioRef.current = saved.yRatio;
    }

    const observer = new ResizeObserver(() => {
      const layerHeight = layer.clientHeight;
      const { min, max } = bandFor(layerHeight, HANDLE_H);
      setPlacement((current) => ({
        side: sideRef.current,
        // yRatio only catches up on release, so re-seating from it mid-drag
        // would snatch the drawer away from the finger.
        top:
          draggedRef.current && current
            ? current.top
            : min + yRatioRef.current * (max - min),
        layerWidth: layer.clientWidth,
        layerHeight,
      }));
    });
    observer.observe(layer);
    return () => observer.disconnect();
  }, []);

  // Only the pill auto-retracts. The options step is a question, so it waits for
  // an answer (or a tap outside / Escape) instead of timing out on the user.
  useEffect(() => {
    if (stage !== "cta") return;
    holdTimerRef.current = window.setTimeout(() => {
      holdTimerRef.current = null;
      setStage("handle");
    }, HOLD_MS);
    // Re-running on a *new* claim restarts the hold, so back-to-back claims
    // each get a full window instead of the first timer cutting the second short.
    return () => {
      if (holdTimerRef.current !== null) {
        window.clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };
  }, [stage, seenClaimKey]);

  // Anything aimed elsewhere answers "not now" and re-hides the drawer.
  useEffect(() => {
    if (stage === "handle") return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      // The host closes the whole assistant on Escape from a bubble-phase
      // window listener. Capturing on `document` puts this first in the path,
      // so dismissing the drawer costs the user their conversation view.
      event.stopPropagation();
      setStage("handle");
    }
    function handleOutside(event: globalThis.PointerEvent) {
      const target = event.target;
      if (target instanceof Node && shellRef.current?.contains(target)) return;
      setStage("handle");
    }

    document.addEventListener("keydown", handleKeyDown, true);
    // A listener rather than a scrim, and pointerdown rather than click: the
    // drawer gets out of the way *and* the tap still reaches whatever it was
    // aimed at. A scrim would swallow that first tap, which matters most for
    // the pill that opens itself after a claim — five seconds of an invisible
    // sheet over the thread is five seconds the chat is not scrollable.
    document.addEventListener("pointerdown", handleOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("pointerdown", handleOutside);
    };
  }, [stage]);

  useEffect(() => {
    placementRef.current = placement;
  }, [placement]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      gestureCleanupRef.current?.();
    },
    [],
  );

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    const layer = layerRef.current;
    const shell = shellRef.current;
    if (!layer || !shell || event.button !== 0 || gestureCleanupRef.current) {
      return;
    }

    // Hold the open state while the user reaches for it — retracting out from
    // under a finger mid-grab is the one thing this must never do.
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    const layerBox = layer.getBoundingClientRect();
    const shellBox = shell.getBoundingClientRect();
    // Measured rather than derived, so handing the wall-anchored position over
    // to free-drag positioning cannot jump.
    originRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      left: shellBox.left - layerBox.left,
      top: shellBox.top - layerBox.top,
    };
    latestRef.current = { left: originRef.current.left, top: originRef.current.top };
    draggedRef.current = false;
    activePointerRef.current = event.pointerId;

    // Tracked on `window` rather than on the element or via `setPointerCapture`,
    // both of which drop drags this widget has to survive. A quick flick can put
    // the very first pointermove past the 48px tab, and an element-scoped
    // listener simply never sees it. Pointer capture fixes that but retargets
    // the closing `click` to the shell, which would swallow every tap meant for
    // the buttons inside it.
    const onMove = (moveEvent: globalThis.PointerEvent) => trackMove(moveEvent);
    const onUp = (upEvent: globalThis.PointerEvent) => settle(upEvent, false);
    const onCancel = (cancelEvent: globalThis.PointerEvent) =>
      settle(cancelEvent, true);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    gestureCleanupRef.current = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }

  function trackMove(event: globalThis.PointerEvent) {
    const placed = placementRef.current;
    if (!placed || activePointerRef.current !== event.pointerId) return;

    const origin = originRef.current;
    const dx = event.clientX - origin.pointerX;
    const dy = event.clientY - origin.pointerY;

    if (!draggedRef.current) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      draggedRef.current = true;
      // A 200px panel dragged around the frame reads as a bug. Collapse to the
      // tab the moment this becomes a drag, and let the release settle it.
      setStage("handle");
    }

    const { min, max } = bandFor(placed.layerHeight, HANDLE_H);
    latestRef.current = {
      // x runs free — release snaps it to a wall regardless.
      left: origin.left + dx,
      top: clamp(origin.top + dy, min, max),
    };

    // Coalesce to one paint: pointers commonly report well above 60Hz.
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const { left, top } = latestRef.current;
      setDragLeft(left);
      setPlacement((current) => (current ? { ...current, top } : current));
    });
  }

  function settle(event: globalThis.PointerEvent, cancelled: boolean) {
    if (activePointerRef.current !== event.pointerId) return;
    activePointerRef.current = null;
    gestureCleanupRef.current?.();
    gestureCleanupRef.current = null;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    // A normal release is followed by a `click` that clears the flag. A cancel
    // (a system gesture stealing the pointer) is not, so clear it here or the
    // next keyboard activation gets swallowed as a phantom drag. Either way the
    // drawer still settles where the user left it.
    const wasDragging = draggedRef.current;
    if (cancelled) draggedRef.current = false;
    const placed = placementRef.current;
    if (!wasDragging || !placed) return;

    const { left, top } = latestRef.current;
    const nextSide: WidgetSide =
      left + HANDLE_W / 2 < placed.layerWidth / 2 ? "left" : "right";
    const { min, max } = bandFor(placed.layerHeight, HANDLE_H);
    const yRatio = max > min ? clamp((top - min) / (max - min), 0, 1) : 0;

    sideRef.current = nextSide;
    yRatioRef.current = yRatio;
    setPlacement({ ...placed, side: nextSide, top });
    // Dropping dragLeft restores wall-anchored positioning, and the `left`
    // transition turns that hand-off into the snap animation.
    setDragLeft(null);
    saveWidgetPosition({ side: nextSide, yRatio });
  }

  /**
   * Runs before any button's own handler, so one guard covers the tab, the pill
   * and both options instead of each repeating the check.
   */
  function swallowDragClick(event: MouseEvent<HTMLDivElement>) {
    if (!draggedRef.current) return;
    draggedRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  function handleClear() {
    setStage("handle");
    onClearChat();
  }

  // pointerdown is the only listener the elements need: everything after it is
  // tracked on `window` for the life of the gesture.
  const gesture = { onPointerDown: handlePointerDown };

  const dragging = dragLeft !== null;
  const isRight = placement ? placement.side === "right" : true;
  // Lifted off the wall, the tab has no wall to hug and no clipped half to
  // compensate for, so it rounds out into a puck with the arrow dead centre.
  const { width, height } = dragging
    ? { width: DRAG_SIZE, height: DRAG_SIZE }
    : STAGE_BOX[stage];
  // Every layer hugs the wall-side edge, so growing the box wipes content in
  // from the wall instead of sliding it sideways under `overflow-hidden`.
  const wallEdge: CSSProperties = isRight ? { right: 0 } : { left: 0 };

  // Docked, the tab is pushed past the wall and clipped by the chat frame's own
  // `overflow-hidden`; open, the box is pulled back inside by the page inset.
  const restingLeft = !placement
    ? 0
    : isRight
      ? placement.layerWidth - width + (stage === "handle" ? HANDLE_PEEK : -INSET)
      : stage === "handle"
        ? -HANDLE_PEEK
        : INSET;

  const band = placement
    ? bandFor(placement.layerHeight, height)
    : { min: 0, max: 0 };
  const top = placement ? clamp(placement.top, band.min, band.max) : 0;

  const animated = [
    "left",
    "top",
    "width",
    "height",
    "background-color",
    "box-shadow",
    "border-color",
    "border-radius",
  ]
    .map((property) => `${property} ${DURATION_MS}ms ${EASE}`)
    .join(", ");
  const shellStyle: CSSProperties = {
    top,
    // Half the extra width is given back so the puck grows around the finger
    // instead of lurching off to one side. The drag math keeps using the
    // untouched `dragLeft`, so where it lands is unaffected.
    left: dragging ? dragLeft - (DRAG_SIZE - HANDLE_W) / 2 : restingLeft,
    width,
    height,
    borderRadius: stage === "options" ? 18 : HANDLE_H / 2,
    transition: dragging || reduceMotion ? "none" : animated,
  };

  /** Incoming content waits out most of the resize so the two never overlap. */
  function layerStyle(forStage: Stage): CSSProperties {
    const active = stage === forStage;
    return {
      ...wallEdge,
      opacity: active ? 1 : 0,
      transition: reduceMotion
        ? "none"
        : `opacity ${FADE_MS}ms linear ${active ? DURATION_MS - FADE_MS : 0}ms`,
    };
  }

  return (
    <div
      ref={layerRef}
      onClickCapture={swallowDragClick}
      className="pointer-events-none absolute inset-0 z-30"
    >
      {/* Mounted only once the frame is measured: rendering earlier would play
          `animate-rise-in` at a placeholder position and then jump. */}
      {placement ? (
        <>
          {/* The visible tab is a 22px sliver, so the grab area is a separate
              transparent pad reaching inward from the wall. Ordered before the
              shell for `peer-*`, lifted above it with z-10 so it still takes the
              taps. Dropped mid-drag: the tab is out with the finger, and leaving
              a phantom target parked on the wall is asking for a stray tap. */}
          {stage === "handle" && !dragging ? (
            <button
              type="button"
              aria-label="Open new chat drawer"
              aria-expanded={false}
              onClick={() => setStage("cta")}
              {...gesture}
              style={{ top, height: HANDLE_H, width: PAD_W, ...wallEdge }}
              className="peer pointer-events-auto absolute z-10 touch-none select-none"
            />
          ) : null}

          <div
            ref={shellRef}
            {...gesture}
            style={shellStyle}
            className={`animate-rise-in pointer-events-auto absolute touch-none select-none overflow-hidden border backdrop-blur-xl peer-focus-visible:ring-2 peer-focus-visible:ring-pine-primary ${
              stage === "cta"
                ? "border-transparent bg-pine-primary shadow-cta"
                : stage === "options"
                  ? "border-border-soft bg-white/95 shadow-menu"
                  : `border-white/60 bg-white/90 ${dragging ? "shadow-cta" : "shadow-card"}`
            }`}
          >
            {/* Chevron points inward — "pull me out". Docked, it is centred in
                the full 34px tab, so once the tab hangs past the wall it would
                sit almost on the edge; nudging it back by half the peek
                re-centres it inside the *visible* sliver. Nothing is clipped
                while dragging, so the puck centres it honestly. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 grid place-items-center text-pine/55"
              style={{
                ...layerStyle("handle"),
                width: dragging ? DRAG_SIZE : HANDLE_W,
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  transform: dragging
                    ? isRight
                      ? "none"
                      : "scaleX(-1)"
                    : `translateX(${isRight ? -HANDLE_PEEK / 2 : HANDLE_PEEK / 2}px)${
                        isRight ? "" : " scaleX(-1)"
                      }`,
                }}
              >
                <path
                  d="M14.5 5.5 8 12l6.5 6.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <button
              type="button"
              inert={stage !== "cta"}
              onClick={() => {
                if (hasEligibleBillDrafts && onRequestDraftDecision) {
                  setStage("handle");
                  onRequestDraftDecision();
                  return;
                }
                setStage("options");
              }}
              style={{ ...layerStyle("cta"), width: CTA_W }}
              className={`absolute inset-y-0 flex items-center ${
                isRight ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center">
                <AppIcon
                  src={UI_ICONS.plus}
                  size={22}
                  alt=""
                  className="brightness-0 invert"
                />
              </span>
              <span
                className={`whitespace-nowrap text-body-sm font-bold text-white ${
                  isRight ? "pl-4" : "pr-4"
                }`}
              >
                New chat
              </span>
            </button>

            <div
              role="group"
              aria-label="Start a new chat"
              inert={stage !== "options"}
              style={{ ...layerStyle("options"), width: OPTIONS_W }}
              className="absolute inset-y-0 flex flex-col gap-1.5 p-2.5"
            >
              <p className="px-1 text-caption font-bold text-subtle">
                Start a new chat?
              </p>
              <button
                type="button"
                onClick={handleClear}
                className="min-h-11 rounded-control bg-pine-primary px-3 text-body-sm font-bold text-white"
              >
                Clear chat
              </button>
              <button
                type="button"
                onClick={() => setStage("handle")}
                className="min-h-11 rounded-control border border-input-border bg-white px-3 text-body-sm font-bold text-pine"
              >
                Keep chatting
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
