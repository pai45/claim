"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  BENEFITS_FAB_SELECTOR,
  BENEFITS_NAV_SELECTOR,
  CARD_VISIBLE_MS,
  HALO_LINGER_MS,
  INSTALL_PROMPT_TITLE_ID,
  markNudgeShown,
  NUDGE_ARM_DELAY_MS,
  readNudgeShown,
  shouldArmBenefitsNudge,
} from "@/features/benefits-nudge/nudge";
import type { PersonaId } from "@/features/persona/types";
import "./benefitsCtaNudge.css";

/** Must match `benefits-nudge-fade-out` in the stylesheet. */
const CARD_EXIT_MS = 320;
/** Gap between the halo around the button and the card's caret. */
const CARD_GAP = 16;
/** Keeps the caret clear of the card's 16px rounded corners. */
const CARET_INSET = 24;
/** Must match the card's `left`/`right` in the stylesheet. */
const CARD_MARGIN = 16;
/** Lets the halo clear the button's own drop shadow. */
const HALO_PADDING = 4;

/**
 * `idle` covers the armed five seconds too — nothing is drawn until the timer
 * fires, so there is no separate state worth holding for it.
 */
type Phase = "idle" | "card" | "card-leaving" | "halo" | "done";

type Geometry = {
  haloTop: number;
  haloLeft: number;
  haloWidth: number;
  haloHeight: number;
  /** Distance from the root's bottom edge to the card's bottom edge. */
  cardBottom: number;
  /** Caret offset from the card's left edge. */
  pointerLeft: number;
};

type CardStyle = CSSProperties & {
  "--benefits-nudge-pointer-left": string;
};

type BenefitsCtaNudgeProps = {
  personaId: PersonaId;
  /** No overlay owns the screen — chat, scanner, MPIN and EB+ setup all closed. */
  surfaceClear: boolean;
  /** In PlusPay mode the centre action is Scan & Pay, which has no target. */
  plusPayMode: boolean;
  /** The embedded home app has loaded, so the nav has settled where it lands. */
  frameReady: boolean;
};

/**
 * Points a returning user at the Benefits Assistant they have not opened.
 *
 * Deliberately not a walkthrough: nothing is dimmed, nothing is blocked, and
 * the real Benefits link stays tappable underneath the whole time. The card
 * retires itself after a while and leaves a pulsing halo on the button as the
 * quieter half of the same hint.
 */
export function BenefitsCtaNudge({
  personaId,
  surfaceClear,
  plusPayMode,
  frameReady,
}: BenefitsCtaNudgeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [geometry, setGeometry] = useState<Geometry | null>(null);

  const retire = useCallback(() => setPhase("done"), []);

  /**
   * The nav is `position: fixed`, but so is this root — and at desktop widths
   * `.desktop-mobile-frame` has a transform and becomes the containing block
   * for both. Subtracting the root's own origin makes the maths identical
   * either way, the same correction `WalkthroughOverlay` applies.
   *
   * Returns null rather than setting state, so the caller decides what a
   * missing target means: before the card is up it cancels the whole thing,
   * afterwards it only clears the geometry.
   */
  const measure = useCallback((): Geometry | null => {
    const root = rootRef.current;
    if (!root) return null;

    const target = document.querySelector<HTMLElement>(BENEFITS_FAB_SELECTOR);
    if (!target || target.offsetParent === null) return null;

    const rect = target.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const origin = root.getBoundingClientRect();
    const haloTop = rect.top - origin.top - HALO_PADDING;
    const cardWidth = Math.max(0, origin.width - CARD_MARGIN * 2);
    const centre = rect.left - origin.left + rect.width / 2 - CARD_MARGIN;

    return {
      haloTop,
      haloLeft: rect.left - origin.left - HALO_PADDING,
      haloWidth: rect.width + HALO_PADDING * 2,
      haloHeight: rect.height + HALO_PADDING * 2,
      cardBottom: origin.height - haloTop + CARD_GAP,
      pointerLeft: Math.min(
        Math.max(centre, CARET_INSET),
        Math.max(CARET_INSET, cardWidth - CARET_INSET),
      ),
    };
  }, []);

  // Arm once the home screen is the bare home screen. Eligibility is checked
  // again inside the callback because five seconds is long enough for the
  // install prompt to arrive or the nav to be swapped out underneath us.
  useEffect(() => {
    if (phase !== "idle") return;
    if (
      !shouldArmBenefitsNudge({
        personaId,
        surfaceClear,
        plusPayMode,
        frameReady,
        alreadyShown: readNudgeShown(window.sessionStorage),
      })
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      // The install prompt covers the nav from z-[200]; a caret pointing at a
      // hidden button would point at nothing. Leaving the nudge unmarked lets
      // it arm again the next time the gate changes.
      if (document.getElementById(INSTALL_PROMPT_TITLE_ID)) return;

      const measured = measure();
      if (!measured) return;

      markNudgeShown(window.sessionStorage);
      setGeometry(measured);
      setPhase("card");
    }, NUDGE_ARM_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [frameReady, measure, personaId, phase, plusPayMode, surfaceClear]);

  // Opening the assistant is the outcome this is asking for, so the nudge gets
  // out of the way and stays away for the session. Matching the element rather
  // than hit-testing coordinates means the label counts as much as the circle;
  // capture phase so the tap is seen before the host's handler navigates.
  useEffect(() => {
    if (phase === "done") return;

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest(BENEFITS_NAV_SELECTOR)) return;
      markNudgeShown(window.sessionStorage);
      retire();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [phase, retire]);

  useEffect(() => {
    if (phase !== "card") return;
    const timer = window.setTimeout(
      () => setPhase("card-leaving"),
      CARD_VISIBLE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "card-leaving") return;
    const timer = window.setTimeout(() => setPhase("halo"), CARD_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "halo") return;
    const timer = window.setTimeout(retire, HALO_LINGER_MS);
    return () => window.clearTimeout(timer);
  }, [phase, retire]);

  useEffect(() => {
    if (phase !== "card") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") retire();
    };
    // Plain bubble-phase listener, unlike the walkthrough's: every surface
    // whose own Escape handler could collide with this one also hides the
    // nudge, so the two are never listening at the same time.
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, retire]);

  // A busy surface hides the nudge rather than retiring it. The phase timers
  // keep running underneath, so a long detour expires it on its own, while
  // tapping Benefits — the one departure worth reacting to — is caught above.
  const showing =
    surfaceClear &&
    !plusPayMode &&
    (phase === "card" || phase === "card-leaving" || phase === "halo");

  useEffect(() => {
    if (!showing) return;
    const remeasure = () => setGeometry(measure());

    window.addEventListener("resize", remeasure);
    document.addEventListener("visibilitychange", remeasure);
    return () => {
      window.removeEventListener("resize", remeasure);
      document.removeEventListener("visibilitychange", remeasure);
    };
  }, [measure, showing]);

  return (
    // Always mounted: the live region has to exist before the card is put into
    // it to be announced reliably, and the arming timer measures against this
    // element's own box before anything is drawn.
    <div
      ref={rootRef}
      className="benefits-nudge-root"
      // Not a dialog — nothing is modal, and the control this points at lives
      // outside the container, so claiming modality here would be a lie.
      role="status"
      aria-live="polite"
    >
      {showing && geometry ? (
        <>
          <span
            className="benefits-nudge-halo"
            style={{
              top: geometry.haloTop,
              left: geometry.haloLeft,
              width: geometry.haloWidth,
              height: geometry.haloHeight,
            }}
            aria-hidden="true"
          />

          {phase === "halo" ? null : (
            <div
              className={`benefits-nudge-card${
                phase === "card-leaving" ? " is-leaving" : ""
              }`}
              style={
                {
                  bottom: geometry.cardBottom,
                  "--benefits-nudge-pointer-left": `${geometry.pointerLeft}px`,
                } as CardStyle
              }
            >
              <div className="benefits-nudge-surface rounded-card p-4 shadow-drawer">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    {/* The `type-*` roles all set a dark ink colour and are
                        unlayered, so they cannot be recoloured for this card. */}
                    <p className="text-caption font-bold uppercase tracking-[0.2px] text-mint">
                      Benefits Assistant
                    </p>
                    <h2 className="mt-1 font-display text-title-sm font-bold text-white">
                      Still here to help
                    </h2>
                    <p className="mt-1.5 text-body-sm text-white/75">
                      Submit a claim, track one, or find where your wallets
                      work — one tap away.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={retire}
                    aria-label="Dismiss"
                    className="-mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded-full text-white/70"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      className="size-4"
                      aria-hidden="true"
                    >
                      <path d="m6 6 12 12M18 6 6 18" />
                    </svg>
                  </button>
                </div>
              </div>

              <span className="benefits-nudge-caret" aria-hidden="true" />
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
