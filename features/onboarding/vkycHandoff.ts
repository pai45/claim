/**
 * Hands the KYC journey off to the Pine Labs VKYC page, which by design lives
 * outside the app: a real tab on the web, the system browser from an installed
 * PWA, and the system browser via the native bridge inside the Expo shell.
 *
 * The page reports back through a `localStorage` flag rather than a live
 * channel, because the user is expected to return to the app under their own
 * steam — the app only has to know, on the way back, whether the demo actually
 * finished. That flag crosses tabs on the web and inside a PWA (same origin,
 * same profile) but *not* out of the WebView, whose storage is separate from
 * the system browser's. `OnboardingShell` handles that platform difference.
 */

import { withBasePath } from "@/lib/basePath";
import { detectAppPlatform } from "@/lib/pwa/platform";

export const VKYC_DONE_KEY = "eb-claims:vkyc-demo-done";

/** `next.config.ts` sets `trailingSlash: true`, so the slash is not optional. */
export const VKYC_PATH = "/vkyc/";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type HandoffRoute =
  /** Posted to the native shell, which opens the system browser. */
  | "external"
  /** A real second tab. */
  | "new-tab"
  /** `window.open` was blocked; this tab navigated instead. */
  | "same-tab";

export function buildVkycUrl(): string {
  return new URL(withBasePath(VKYC_PATH), window.location.origin).toString();
}

export function markVkycDone(
  storage: StorageLike = window.localStorage,
): void {
  try {
    storage.setItem(VKYC_DONE_KEY, "1");
  } catch {
    // Private browsing can block writes. The native-shell fallback in
    // OnboardingShell still lets the journey finish.
  }
}

export function readVkycDone(
  storage: StorageLike = window.localStorage,
): boolean {
  try {
    return storage.getItem(VKYC_DONE_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearVkycDone(
  storage: StorageLike = window.localStorage,
): void {
  try {
    storage.removeItem(VKYC_DONE_KEY);
  } catch {
    // Nothing to do; a stale flag is cleared again on the next hand-off.
  }
}

/**
 * Call this synchronously from the click handler. Deferring it behind an await
 * or a state update costs the user-gesture flag and the popup is blocked.
 */
export function openVkycDemo(): HandoffRoute {
  clearVkycDone();
  const url = buildVkycUrl();

  if (detectAppPlatform() === "native-shell") {
    // `window.open` is not an option here: Android WebView leaves it to
    // `onOpenWindow`, and a plain navigation would be swallowed by the shell's
    // `isInternalUrl` check and load the page *inside* the WebView.
    window.ReactNativeWebView?.postMessage(
      JSON.stringify({ type: "open-external", url }),
    );
    return "external";
  }

  const opened = window.open(url, "_blank", "noopener");
  if (opened) return "new-tab";

  // Blocked. The waiting state is already persisted, so leaving this tab is
  // recoverable — the browser back button lands back on the KYC screen.
  window.location.assign(url);
  return "same-tab";
}
