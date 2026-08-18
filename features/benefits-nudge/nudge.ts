/**
 * Decides whether the returning user gets a nudge toward the Benefits button.
 *
 * The `new_user` persona already learns about the Benefits Assistant from the
 * five-step `eb-home` walkthrough, whose last step spotlights this same button.
 * A returning user skips all of that — they log in with one tap and land on the
 * home screen with nothing pointing at the assistant. This is the replacement
 * for them: one card, no scrim, gone on its own if ignored.
 *
 * Kept apart from `features/walkthrough` deliberately. That module is a tour
 * engine — ordered steps, pause and resume across page loads, a spotlight that
 * blocks everything outside it. None of that applies to a single hint that must
 * leave the app usable underneath.
 */

import type { PersonaId } from "@/features/persona/types";
import { EB_HOME_HOST_SELECTORS } from "@/features/walkthrough/steps";

/**
 * Session-scoped, so every fresh presentation shows the nudge again. It is also
 * cleared by `resetDemoJourney`, which is what a persona pick on the login
 * screen runs — that is what re-arms this on each login rather than only once
 * per browser tab.
 */
export const BENEFITS_NUDGE_SHOWN_KEY = "eb-claims:benefits-nudge-shown:v1";

/**
 * Long enough that someone who came here to open the assistant has already
 * tapped it, so the nudge only ever meets a user who did not.
 */
export const NUDGE_ARM_DELAY_MS = 5_000;

/**
 * How long the card stays before retiring itself. The halo on the button keeps
 * the hint alive after it goes, so this can be short enough not to nag.
 */
export const CARD_VISIBLE_MS = 12_000;

/** Caps the halo, so an abandoned tab is not left animating indefinitely. */
export const HALO_LINGER_MS = 20_000;

/**
 * The 60px floating circle inside the Benefits tab, not the whole nav cell.
 * The cell is 139px tall and mostly empty; a halo drawn around it would be a
 * tall rectangle rather than a ring on the button.
 */
export const BENEFITS_FAB_SELECTOR = "[data-benefits-fab]";

/**
 * The whole Benefits tab, for noticing that the user took the hint — its label
 * opens the assistant just as the circle does. Borrowed from the walkthrough's
 * map rather than re-declared, so the two cannot drift apart.
 */
export const BENEFITS_NAV_SELECTOR = EB_HOME_HOST_SELECTORS["benefits-nav"];

/**
 * `AddToHomeScreenPrompt` labels itself with this id. It sits at `z-[200]` over
 * the whole nav, so when it is up the Benefits button is covered and a caret
 * pointing at it would point at nothing.
 */
export const INSTALL_PROMPT_TITLE_ID = "a2hs-title";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type BenefitsNudgeGate = {
  personaId: PersonaId;
  /** No overlay owns the screen — chat, scanner, MPIN, EB+ setup all closed. */
  surfaceClear: boolean;
  /** In PlusPay mode the centre action is Scan & Pay, and has no target. */
  plusPayMode: boolean;
  /** The embedded home app has loaded, so the nav has settled where it lands. */
  frameReady: boolean;
  alreadyShown: boolean;
};

export function shouldArmBenefitsNudge({
  personaId,
  surfaceClear,
  plusPayMode,
  frameReady,
  alreadyShown,
}: BenefitsNudgeGate): boolean {
  if (personaId !== "returning") return false;
  if (plusPayMode) return false;
  if (!surfaceClear) return false;
  if (!frameReady) return false;
  if (alreadyShown) return false;
  return true;
}

/** Storage access is wrapped because private browsing can make it throw. */
export function readNudgeShown(storage: StorageLike): boolean {
  try {
    return storage.getItem(BENEFITS_NUDGE_SHOWN_KEY) === "true";
  } catch {
    // Treat blocked storage as "already shown", the same way
    // `hasSeenWalkthrough` does, so nothing auto-plays on every render.
    return true;
  }
}

export function markNudgeShown(storage: StorageLike): void {
  try {
    storage.setItem(BENEFITS_NUDGE_SHOWN_KEY, "true");
  } catch {
    // Nothing to do; the nudge simply may appear again later in the session.
  }
}
