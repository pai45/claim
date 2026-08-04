import { COUNTRY_CODE, isValidMobile } from "./phoneNumber";

export const AUTH_STORAGE_KEY = "eb-claims:auth-session";
export const AUTH_STORAGE_VERSION = 1;
/** localStorage's `storage` event never fires in the tab that wrote it. */
export const AUTH_SESSION_EVENT = "eb-claims:auth-session-changed";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type PersistedAuthSession = {
  version: typeof AUTH_STORAGE_VERSION;
  /** Canonical national digits, e.g. "9876543210". */
  mobile: string;
  /**
   * Only "+91" exists today. Persisted anyway so a future country picker can
   * read old records without a version bump.
   */
  countryCode: typeof COUNTRY_CODE;
  signedInAt: number;
};

export type AuthSession = {
  mobile: string;
  countryCode: typeof COUNTRY_CODE;
  signedInAt: number;
};

function notify(): void {
  // The store is imported by node-environment tests, where there is no window.
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function saveAuthSession(
  mobile: string,
  storage: StorageLike = window.localStorage,
  now = Date.now(),
): void {
  const record: PersistedAuthSession = {
    version: AUTH_STORAGE_VERSION,
    mobile,
    countryCode: COUNTRY_CODE,
    signedInAt: now,
  };

  try {
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage may be unavailable in private browsing or managed environments.
  }

  notify();
}

/**
 * Deliberately re-validates the stored number rather than trusting it. A
 * hand-edited or newly-invalid record must drop the user back to login instead
 * of wedging the gate open on a number the app can no longer render.
 */
export function loadAuthSession(
  storage: StorageLike = window.localStorage,
): AuthSession | null {
  try {
    const raw = storage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedAuthSession>;
    if (
      parsed.version !== AUTH_STORAGE_VERSION ||
      typeof parsed.mobile !== "string" ||
      !isValidMobile(parsed.mobile) ||
      parsed.countryCode !== COUNTRY_CODE ||
      typeof parsed.signedInAt !== "number"
    ) {
      storage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return {
      mobile: parsed.mobile,
      countryCode: parsed.countryCode,
      signedInAt: parsed.signedInAt,
    };
  } catch {
    try {
      storage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Nothing left to do if removal is blocked too.
    }
    return null;
  }
}

export function clearAuthSession(
  storage: StorageLike = window.localStorage,
): void {
  try {
    storage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Clearing should remain safe when storage is blocked.
  }
  notify();
}

/**
 * Fires on same-tab writes (custom event) and cross-tab writes (`storage`).
 * Returns an unsubscribe.
 */
export function subscribeToAuthSession(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    // A null key means localStorage.clear(), which wipes this key too.
    if (event.key === AUTH_STORAGE_KEY || event.key === null) listener();
  };

  window.addEventListener(AUTH_SESSION_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(AUTH_SESSION_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
