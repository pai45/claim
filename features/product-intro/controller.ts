import type { PersonaId } from "@/features/persona/types";

export const PRODUCT_INTRO_SLIDES = [
  {
    id: "payments",
    title: "Flexible payment options",
    description:
      "Enjoy hassle-free payments with UPI, prepaid cards, and Tap & Pay in one place.",
  },
  {
    id: "tracking",
    title: "Easy expense tracking",
    description: "Manage expenses and receipts seamlessly in one place.",
  },
  {
    id: "signup",
    title: "Start in minutes",
    description: "Get started quickly with a simple sign-up and hassle-free KYC.",
  },
] as const;

export const PRODUCT_INTRO_LAST_INDEX = PRODUCT_INTRO_SLIDES.length - 1;
export const PRODUCT_INTRO_SWIPE_THRESHOLD_PX = 48;

/**
 * Aarav Patel (new_user) replays the product intro whenever selected. Other
 * profiles retain first-time-only behavior through the persisted completion
 * flag.
 */
export function shouldShowProductIntro(
  personaId: PersonaId | null,
  completed: boolean,
  dismissedForSelection: boolean,
): boolean {
  if (!personaId || dismissedForSelection) return false;
  return personaId === "new_user" || !completed;
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
