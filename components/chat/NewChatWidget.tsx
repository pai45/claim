"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { AppIcon } from "@/components/shared/AppIcon";
import { UI_ICONS } from "@/lib/ui/assets";
import {
  DEFAULT_WIDGET_POSITION,
  loadWidgetPosition,
  saveWidgetPosition,
  type WidgetSide,
} from "@/features/chat/widgetPosition";

type NewChatWidgetProps = {
  /** ChatShell's `requestClear` — it already routes through the confirm dialog. */
  onNewChat: () => void;
  /**
   * Id of the newest completed-claim turn, or null when the thread has none.
   * Every *change* to a non-null value pops the widget open for {@link HOLD_MS}.
   * A restored session therefore stays quiet: the value is already current on
   * the first render, so there is nothing to change.
   */
  completedClaimKey: string | null;
  /** Already computed by ChatShell for the ColorBends backdrop. */
  reduceMotion: boolean;
};

/** Collapsed diameter. {@link PEEK} of it hangs past the wall and is clipped away. */
const SIZE = 60;
/**
 * Expanded width is a fixed constant rather than `auto` so the pill can animate
 * at all — and, on the right wall, so `left` and `width` can share one easing
 * curve. Both then interpolate between known endpoints, which keeps the right
 * edge pinned to the wall for the whole transition instead of chasing a width
 * that is still being measured.
 */
const EXPANDED_WIDTH = 148;
/**
 * How far the docked circle sits past the frame, clipped by its `overflow-hidden`.
 * 26 of 60 hidden leaves ~57% showing.
 */
const PEEK = 26;
/** Inset from the wall while expanded — matches `--spacing-page`. */
const INSET = 16;
/** Clears the 69px header with a little air. */
const TOP_GUTTER = 76;
/** Reserves the composer's band so the widget can never sit on the input. */
const BOTTOM_GUTTER = 104;
/** Movement past this many px is a drag, not a tap. */
const DRAG_THRESHOLD = 6;
const HOLD_MS = 5000;
const DURATION_MS = 360;
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

/** The px range `yRatio` maps onto, derived from the live frame height. */
function bandFor(height: number) {
  const min = TOP_GUTTER;
  return { min, max: Math.max(min, height - BOTTOM_GUTTER - SIZE) };
}

export function NewChatWidget({
  onNewChat,
  completedClaimKey,
  reduceMotion,
}: NewChatWidgetProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Placement is published from callbacks (the resize observer, the drag
  // handlers) while the refs below stay the authoritative, synchronously
  // readable copy the gesture math needs.
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [dragLeft, setDragLeft] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [seenClaimKey, setSeenClaimKey] = useState(completedClaimKey);

  const sideRef = useRef<WidgetSide>(DEFAULT_WIDGET_POSITION.side);
  const yRatioRef = useRef(DEFAULT_WIDGET_POSITION.yRatio);
  const holdTimerRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  // Written synchronously on every move; the painted copy lags a frame behind,
  // and pointerup has to settle on the finger's real last position.
  const latestRef = useRef({ left: 0, top: 0 });
  // A drag ends with a native `click`. This suppresses it so releasing the
  // widget somewhere new does not also start a new chat.
  const draggedRef = useRef(false);
  const originRef = useRef({ pointerX: 0, pointerY: 0, left: 0, top: 0 });

  // React's "adjust state when a prop changes" pattern. An effect would be the
  // obvious home for this, but setting state straight from an effect body costs
  // a second render pass with a paint in between — here that paint would show
  // the collapsed pill for a frame before it opens.
  if (completedClaimKey !== seenClaimKey) {
    setSeenClaimKey(completedClaimKey);
    if (completedClaimKey) setExpanded(true);
  }

  // `h-dvh` shrinks when the soft keyboard opens, which would otherwise leave
  // the widget floating over the composer or clipped out of view entirely.
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
      const { min, max } = bandFor(layerHeight);
      setPlacement((current) => ({
        side: sideRef.current,
        // yRatio only catches up on release, so re-seating from it mid-drag
        // would snatch the widget away from the finger.
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

  useEffect(() => {
    if (!expanded) return;
    holdTimerRef.current = window.setTimeout(() => {
      holdTimerRef.current = null;
      setExpanded(false);
    }, HOLD_MS);
    // Re-running on a *new* claim restarts the hold, so back-to-back claims
    // each get a full window instead of the first timer cutting the second short.
    return () => {
      if (holdTimerRef.current !== null) {
        window.clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };
  }, [expanded, seenClaimKey]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    const layer = layerRef.current;
    const button = buttonRef.current;
    if (!layer || !button || event.button !== 0) return;

    // Hold the open state while the user reaches for it — retracting out from
    // under a finger mid-grab is the one thing this must never do.
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    const layerBox = layer.getBoundingClientRect();
    const buttonBox = button.getBoundingClientRect();
    // Measured rather than derived, so handing the wall-anchored position over
    // to free-drag positioning cannot jump.
    originRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      left: buttonBox.left - layerBox.left,
      top: buttonBox.top - layerBox.top,
    };
    latestRef.current = { left: originRef.current.left, top: originRef.current.top };
    draggedRef.current = false;
    button.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const button = buttonRef.current;
    if (!placement || !button?.hasPointerCapture(event.pointerId)) return;

    const origin = originRef.current;
    const dx = event.clientX - origin.pointerX;
    const dy = event.clientY - origin.pointerY;

    if (!draggedRef.current) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      draggedRef.current = true;
    }

    const { min, max } = bandFor(placement.layerHeight);
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

  function settle(event: PointerEvent<HTMLButtonElement>, cancelled: boolean) {
    const button = buttonRef.current;
    if (button?.hasPointerCapture(event.pointerId)) {
      button.releasePointerCapture(event.pointerId);
    }
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    // A normal release is followed by a `click` that clears the flag. A cancel
    // (a system gesture stealing the pointer) is not, so clear it here or the
    // next keyboard activation gets swallowed as a phantom drag. Either way the
    // widget still settles where the user left it.
    const wasDragging = draggedRef.current;
    if (cancelled) draggedRef.current = false;
    if (!wasDragging || !placement) return;

    const { left, top } = latestRef.current;
    const width = expanded ? EXPANDED_WIDTH : SIZE;
    const nextSide: WidgetSide =
      left + width / 2 < placement.layerWidth / 2 ? "left" : "right";
    const { min, max } = bandFor(placement.layerHeight);
    const yRatio = max > min ? clamp((top - min) / (max - min), 0, 1) : 0;

    sideRef.current = nextSide;
    yRatioRef.current = yRatio;
    setPlacement({ ...placement, side: nextSide, top });
    // Dropping dragLeft restores wall-anchored positioning, and the `left`
    // transition turns that hand-off into the snap animation.
    setDragLeft(null);
    setExpanded(false);
    saveWidgetPosition({ side: nextSide, yRatio });
  }

  function handleClick() {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    onNewChat();
  }

  const dragging = dragLeft !== null;
  const isRight = placement ? placement.side === "right" : true;
  const width = expanded ? EXPANDED_WIDTH : SIZE;
  // Docked, the pill is pushed past the wall and clipped by the chat frame's own
  // `overflow-hidden`; expanded, it is pulled back inside by the page inset.
  const restingLeft = !placement
    ? 0
    : isRight
      ? placement.layerWidth - width + (expanded ? -INSET : PEEK)
      : expanded
        ? INSET
        : -PEEK;

  const animated = ["left", "top", "width", "background-color", "box-shadow", "border-color"]
    .map((property) => `${property} ${DURATION_MS}ms ${EASE}`)
    .join(", ");
  const style: CSSProperties = {
    top: placement?.top ?? 0,
    left: dragging ? dragLeft : restingLeft,
    width,
    transition: dragging || reduceMotion ? "none" : animated,
  };

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0 z-30">
      {/* Mounted only once the frame is measured: rendering earlier would play
          `animate-rise-in` at a placeholder position and then jump. */}
      {placement ? (
        <button
          ref={buttonRef}
          type="button"
          aria-label="New chat"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={(event) => settle(event, false)}
          onPointerCancel={(event) => settle(event, true)}
          onClick={handleClick}
          style={style}
          className={`animate-rise-in pointer-events-auto absolute flex h-15 touch-none select-none items-center overflow-hidden rounded-pill border backdrop-blur-xl ${
            isRight ? "flex-row-reverse" : "flex-row"
          } ${
            expanded
              ? "border-transparent bg-pine-primary shadow-cta"
              : `border-white/60 bg-white/90 ${dragging ? "shadow-cta" : "shadow-card"}`
          }`}
        >
          {/* The glyph is centred in the full 60px circle, so once the circle
              hangs past the wall it would sit almost on the edge. Nudging it
              back by half the peek re-centres it inside the *visible* sliver. */}
          <span
            className="grid h-15 w-15 shrink-0 place-items-center transition-transform duration-360 motion-reduce:transition-none"
            style={{
              transform:
                expanded || dragging
                  ? "none"
                  : `translateX(${isRight ? -PEEK / 2 : PEEK / 2}px)`,
            }}
          >
            <AppIcon
              src={UI_ICONS.plus}
              size={22}
              alt=""
              className={expanded ? "brightness-0 invert" : "opacity-80"}
            />
          </span>
          <span
            aria-hidden
            className={`whitespace-nowrap text-body-sm font-bold text-white transition-opacity duration-360 motion-reduce:transition-none ${
              isRight ? "pl-4" : "pr-4"
            } ${expanded ? "opacity-100" : "opacity-0"}`}
          >
            New chat
          </span>
        </button>
      ) : null}
    </div>
  );
}
