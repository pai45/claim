export const DIRECT_CLAIMS_HASH = "#claims";
export const IN_APP_CLAIMS_ENTRY_KEY = "eb-claims:in-app-claims-entry";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/**
 * The auth bypass belongs to the exact home-page deep link only. Keeping this
 * as a one-time entry check (rather than a hash-change listener) prevents an
 * in-app navigation to the assistant from turning into an authentication
 * bypass.
 */
export function isDirectClaimsEntry(hash: string, search: string): boolean {
  return search === "" && hash.toLowerCase() === DIRECT_CLAIMS_HASH;
}

export function resolveClaimsEntry(
  hash: string,
  search: string,
  inAppClaimsEntry: boolean,
): { isClaimsEntry: boolean; shouldSelectDefaultPersona: boolean } {
  const directClaimsEntry = isDirectClaimsEntry(hash, search);
  return {
    isClaimsEntry: directClaimsEntry || inAppClaimsEntry,
    shouldSelectDefaultPersona: directClaimsEntry && !inAppClaimsEntry,
  };
}

/**
 * Marks a navigation that originated inside the signed-in app. The home route
 * otherwise cannot distinguish an internal `/#claims` transition from the
 * public demo deep link, whose legacy behavior deliberately selects Vishal.
 */
export function markInAppClaimsEntry(
  storage: StorageLike = window.sessionStorage,
): void {
  try {
    storage.setItem(IN_APP_CLAIMS_ENTRY_KEY, "true");
  } catch {
    // Navigation still works when session storage is unavailable.
  }
}

/** Consumes the marker so a later genuine deep link keeps its demo behavior. */
export function takeInAppClaimsEntry(
  storage: StorageLike = window.sessionStorage,
): boolean {
  try {
    const marked = storage.getItem(IN_APP_CLAIMS_ENTRY_KEY) === "true";
    storage.removeItem(IN_APP_CLAIMS_ENTRY_KEY);
    return marked;
  } catch {
    return false;
  }
}
