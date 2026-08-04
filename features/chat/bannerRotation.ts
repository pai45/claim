/**
 * Tracks which set of empty-state banners the chat shows.
 *
 * The stage is a demo dial rather than real notification state: the app has no
 * notification service, so "returning user has unread updates" is simulated by
 * advancing a counter each time the assistant is opened.
 */

/** Deliberately cycles instead of sticking at 3, so the demo replays forever. */
export const BANNER_STAGE_COUNT = 3;

export const BANNER_STAGE_KEY = "eb-claims:banner-stage";

export type BannerStage = 1 | 2 | 3;

export const FIRST_BANNER_STAGE: BannerStage = 1;

export function isBannerStage(value: unknown): value is BannerStage {
  return value === 1 || value === 2 || value === 3;
}

/** Wraps 3 → 1; the stages are a loop, not a progression that completes. */
export function nextBannerStage(stage: BannerStage): BannerStage {
  const next = (stage % BANNER_STAGE_COUNT) + 1;
  return isBannerStage(next) ? next : FIRST_BANNER_STAGE;
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/**
 * Storage access is wrapped because private browsing can make it throw. A
 * missing or unusable value means "first visit", which is the safe default:
 * the user sees the promo card the app has always shown.
 */
export function readBannerStage(storage: StorageLike): BannerStage {
  try {
    const raw = storage.getItem(BANNER_STAGE_KEY);
    if (!raw) return FIRST_BANNER_STAGE;
    const parsed = Number.parseInt(raw, 10);
    return isBannerStage(parsed) ? parsed : FIRST_BANNER_STAGE;
  } catch {
    return FIRST_BANNER_STAGE;
  }
}

export function writeBannerStage(
  storage: StorageLike,
  stage: BannerStage,
): void {
  try {
    storage.setItem(BANNER_STAGE_KEY, String(stage));
  } catch {
    // Nothing to do; the stage simply stays at 1 on the next open.
  }
}
