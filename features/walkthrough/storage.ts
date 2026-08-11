import type { WalkthroughId } from "./types";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const WALKTHROUGH_IDS: WalkthroughId[] = ["eb-home", "benefits-assistant"];

/** Persistent — set once a walkthrough finishes, cleared by the demo reset. */
export function seenKey(id: WalkthroughId): string {
  return `eb-claims:walkthrough-seen:${id}:v1`;
}

/**
 * Session-scoped — holds the step a walkthrough was interrupted on. Quick
 * actions leave the host with a full page load, so this cannot live in React
 * state. Session storage also means a paused run never leaks into the next
 * presentation, since closing the tab discards it.
 */
export function pausedKey(id: WalkthroughId): string {
  return `eb-claims:walkthrough-paused:${id}:v1`;
}

export const WALKTHROUGH_SEEN_KEYS = WALKTHROUGH_IDS.map(seenKey);
export const WALKTHROUGH_PAUSED_KEYS = WALKTHROUGH_IDS.map(pausedKey);

function fallbackStorage(): StorageLike {
  return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
}

function defaultLocal(): StorageLike {
  return typeof window !== "undefined" ? window.localStorage : fallbackStorage();
}

function defaultSession(): StorageLike {
  return typeof window !== "undefined"
    ? window.sessionStorage
    : fallbackStorage();
}

export function hasSeenWalkthrough(
  id: WalkthroughId,
  storage: StorageLike = defaultLocal(),
): boolean {
  try {
    return storage.getItem(seenKey(id)) === "true";
  } catch {
    // Treat blocked storage as "already seen" so nothing auto-plays repeatedly.
    return true;
  }
}

export function markWalkthroughSeen(
  id: WalkthroughId,
  storage: StorageLike = defaultLocal(),
): void {
  try {
    storage.setItem(seenKey(id), "true");
  } catch {
    // The run still completes when persistence is unavailable.
  }
}

export function readPausedStep(
  id: WalkthroughId,
  storage: StorageLike = defaultSession(),
): number | null {
  try {
    const raw = storage.getItem(pausedKey(id));
    if (!raw) return null;
    const stepIndex = Number.parseInt(raw, 10);
    return Number.isInteger(stepIndex) && stepIndex >= 0 ? stepIndex : null;
  } catch {
    return null;
  }
}

export function writePausedStep(
  id: WalkthroughId,
  stepIndex: number,
  storage: StorageLike = defaultSession(),
): void {
  try {
    storage.setItem(pausedKey(id), String(stepIndex));
  } catch {
    // Resume is best-effort; the walkthrough simply will not come back.
  }
}

export function clearPausedStep(
  id: WalkthroughId,
  storage: StorageLike = defaultSession(),
): void {
  try {
    storage.removeItem(pausedKey(id));
  } catch {
    // Clearing remains safe when storage is unavailable.
  }
}

/** Wipes both walkthroughs so a presenter gets a fresh auto-play. */
export function clearWalkthroughState(
  local: StorageLike = defaultLocal(),
  session: StorageLike = defaultSession(),
): void {
  WALKTHROUGH_IDS.forEach((id) => {
    try {
      local.removeItem(seenKey(id));
    } catch {
      // Clearing remains safe when storage is unavailable.
    }
    try {
      session.removeItem(pausedKey(id));
    } catch {
      // Clearing remains safe when storage is unavailable.
    }
  });
}
