import type { PersonaId } from "@/features/persona/types";
import { hasReturningAccountState } from "@/features/persona/constants";

export const PRODUCT_INTRO_SLIDES = [
  {
    id: "payments",
    title: "Flexible payment options",
    description:
      "Pay smoothly with UPI, prepaid cards, or Tap & Pay all in one app",
  },
  {
    id: "tracking",
    title: "Easy expense tracking",
    description: "View, track & manage expenses & receipts easily",
  },
  {
    id: "signup",
    title: "Start in minutes",
    description: "Easy signup and quick KYC to get you started",
  },
] as const;

export const PRODUCT_INTRO_LAST_INDEX = PRODUCT_INTRO_SLIDES.length - 1;
export const PRODUCT_INTRO_SWIPE_THRESHOLD_PX = 48;

/**
 * Returning-account demos replay the product intro whenever selected. Other
 * profiles retain first-time-only behavior through the persisted completion
 * flag.
 */
export function shouldShowProductIntro(
  personaId: PersonaId | null,
  completed: boolean,
  dismissedForSelection: boolean,
): boolean {
  if (!personaId || dismissedForSelection) return false;
  return hasReturningAccountState(personaId) || !completed;
}

export function nextProductIntroIndex(index: number): number {
  return Math.min(PRODUCT_INTRO_LAST_INDEX, index + 1);
}

export function previousProductIntroIndex(index: number): number {
  return Math.max(0, index - 1);
}

/**
 * Returns the next index for a horizontal swipe. Vertical or short gestures
 * leave the current slide alone so page scrolling stays natural.
 */
export function resolveProductIntroSwipe(
  index: number,
  deltaX: number,
  deltaY: number,
): number {
  const horizontalDistance = Math.abs(deltaX);
  if (
    horizontalDistance < PRODUCT_INTRO_SWIPE_THRESHOLD_PX ||
    horizontalDistance <= Math.abs(deltaY)
  ) {
    return index;
  }

  return deltaX < 0
    ? nextProductIntroIndex(index)
    : previousProductIntroIndex(index);
}
