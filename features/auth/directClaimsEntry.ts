export const DIRECT_CLAIMS_HASH = "#claims";

/**
 * The auth bypass belongs to the exact home-page deep link only. Keeping this
 * as a one-time entry check (rather than a hash-change listener) prevents an
 * in-app navigation to the assistant from turning into an authentication
 * bypass.
 */
export function isDirectClaimsEntry(hash: string, search: string): boolean {
  return search === "" && hash.toLowerCase() === DIRECT_CLAIMS_HASH;
}
