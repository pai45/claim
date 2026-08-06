import { initialMpinLock, type MpinLock } from "./mpin";

export const MPIN_STORAGE_KEY = "eb-claims:mpin";
export const MPIN_LOCK_STORAGE_KEY = "eb-claims:mpin-lock";
/**
 * Lives in sessionStorage, unlike the two keys above. See `markMpinUnlocked`.
 */
export const MPIN_UNLOCK_STORAGE_KEY = "eb-claims:mpin-unlocked";
export const MPIN_STORAGE_VERSION = 1;
/** localStorage's `storage` event never fires in the tab that wrote it. */
export const MPIN_EVENT = "eb-claims:mpin-changed";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type PersistedMpin = {
  version: typeof MPIN_STORAGE_VERSION;
  salt: string;
  /** Hex SHA-256 of `salt:pin` — see the note on `digestMpin`. */
  digest: string;
  createdAt: number;
};

type PersistedMpinLock = MpinLock & { version: typeof MPIN_STORAGE_VERSION };

function notify(): void {
  // The store is imported by node-environment tests, where there is no window.
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(MPIN_EVENT));
}

export function saveMpin(
  record: Omit<PersistedMpin, "version">,
  storage: StorageLike = window.localStorage,
): void {
  const payload: PersistedMpin = { version: MPIN_STORAGE_VERSION, ...record };

  try {
    storage.setItem(MPIN_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage may be unavailable in private browsing or managed environments.
  }

  notify();
}

/**
 * Drops a malformed record rather than trusting it: a half-written or
 * hand-edited entry would otherwise leave the user stuck on a lock screen no
 * PIN can satisfy. Returning null sends them back through setup instead.
 */
export function loadMpin(
  storage: StorageLike = window.localStorage,
): PersistedMpin | null {
  try {
    const raw = storage.getItem(MPIN_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedMpin>;
    if (
      parsed.version !== MPIN_STORAGE_VERSION ||
      typeof parsed.salt !== "string" ||
      !parsed.salt ||
      typeof parsed.digest !== "string" ||
      !parsed.digest ||
      typeof parsed.createdAt !== "number"
    ) {
      storage.removeItem(MPIN_STORAGE_KEY);
      return null;
    }

    return {
      version: parsed.version,
      salt: parsed.salt,
      digest: parsed.digest,
      createdAt: parsed.createdAt,
    };
  } catch {
    try {
      storage.removeItem(MPIN_STORAGE_KEY);
    } catch {
      // Nothing left to do if removal is blocked too.
    }
    return null;
  }
}

export function isMpinSet(storage: StorageLike = window.localStorage): boolean {
  return loadMpin(storage) !== null;
}

export function clearMpin(storage: StorageLike = window.localStorage): void {
  try {
    storage.removeItem(MPIN_STORAGE_KEY);
  } catch {
    // Clearing should remain safe when storage is blocked.
  }
  notify();
}

/**
 * The cooldown is persisted on purpose: holding it in memory would let a reload
 * hand back three fresh attempts, which is the one thing the lockout exists to
 * prevent.
 */
export function saveMpinLock(
  lock: MpinLock,
  storage: StorageLike = window.localStorage,
): void {
  const payload: PersistedMpinLock = {
    version: MPIN_STORAGE_VERSION,
    ...lock,
  };

  try {
    storage.setItem(MPIN_LOCK_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage may be unavailable in private browsing or managed environments.
  }
}

export function loadMpinLock(
  storage: StorageLike = window.localStorage,
): MpinLock {
  try {
    const raw = storage.getItem(MPIN_LOCK_STORAGE_KEY);
    if (!raw) return initialMpinLock;

    const parsed = JSON.parse(raw) as Partial<PersistedMpinLock>;
    if (
      parsed.version !== MPIN_STORAGE_VERSION ||
      typeof parsed.failedAttempts !== "number" ||
      typeof parsed.lockedUntil !== "number"
    ) {
      storage.removeItem(MPIN_LOCK_STORAGE_KEY);
      return initialMpinLock;
    }

    return {
      failedAttempts: parsed.failedAttempts,
      lockedUntil: parsed.lockedUntil,
    };
  } catch {
    try {
      storage.removeItem(MPIN_LOCK_STORAGE_KEY);
    } catch {
      // Nothing left to do if removal is blocked too.
    }
    return initialMpinLock;
  }
}

export function clearMpinLock(
  storage: StorageLike = window.localStorage,
): void {
  try {
    storage.removeItem(MPIN_LOCK_STORAGE_KEY);
  } catch {
    // Clearing should remain safe when storage is blocked.
  }
}

/**
 * Records that this tab has cleared the MPIN gate.
 *
 * sessionStorage rather than component state: the gate sits on the home screen
 * only, so walking out to /profile or /dashboard and back unmounts it, and
 * re-challenging on every return reads as the unlock never having registered.
 * sessionStorage rather than localStorage: a new tab still starts challenged,
 * which is the boundary "once per app session" actually means here.
 *
 * The value carries the version so a future bump invalidates unlocks that were
 * granted against the old record shape.
 */
export function markMpinUnlocked(
  storage: StorageLike = window.sessionStorage,
): void {
  try {
    storage.setItem(MPIN_UNLOCK_STORAGE_KEY, String(MPIN_STORAGE_VERSION));
  } catch {
    // Storage may be unavailable in private browsing or managed environments.
  }
}

export function isMpinUnlocked(
  storage: StorageLike = window.sessionStorage,
): boolean {
  try {
    return (
      storage.getItem(MPIN_UNLOCK_STORAGE_KEY) === String(MPIN_STORAGE_VERSION)
    );
  } catch {
    // An unreadable store means we cannot prove the gate was cleared.
    return false;
  }
}

export function clearMpinUnlock(
  storage: StorageLike = window.sessionStorage,
): void {
  try {
    storage.removeItem(MPIN_UNLOCK_STORAGE_KEY);
  } catch {
    // Clearing should remain safe when storage is blocked.
  }
}

/**
 * Fires on same-tab writes (custom event) and cross-tab writes (`storage`).
 * Returns an unsubscribe.
 */
export function subscribeToMpin(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    // A null key means localStorage.clear(), which wipes this key too.
    if (event.key === MPIN_STORAGE_KEY || event.key === null) listener();
  };

  window.addEventListener(MPIN_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(MPIN_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
