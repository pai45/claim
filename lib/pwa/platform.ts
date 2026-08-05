/**
 * Where the web app is currently running.
 *
 * The predicates this builds on live in `installNudge.ts`, which keeps them
 * pure so they can be unit tested. This module is the runtime counterpart: it
 * reads the browser globals once and answers the question the KYC hand-off
 * actually asks — "can I open a real browser tab from here?".
 */

import { isInstalled, isIosDevice, isNativeShell } from "./installNudge";

export type AppPlatform =
  /** Inside the Expo WebView shell in `mobile/`. */
  | "native-shell"
  /** Installed to the home screen and running without browser chrome. */
  | "standalone"
  /** An ordinary browser tab. */
  | "browser";

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (message: string) => void };
  }
}

/**
 * Must only be called from an effect or an event handler. Calling it during
 * render would make the server-rendered markup disagree with the client and
 * break hydration on the static export.
 */
export function detectAppPlatform(): AppPlatform {
  if (typeof window === "undefined") return "browser";

  // The injected bridge object is a direct signal, so it beats sniffing the
  // user agent — a WebView that failed to apply `applicationNameForUserAgent`
  // still reports itself correctly here.
  if (window.ReactNativeWebView) return "native-shell";
  if (isNativeShell(window.navigator.userAgent)) return "native-shell";

  const displayModeStandalone = window.matchMedia(
    "(display-mode: standalone)",
  ).matches;
  const navigatorStandalone = (
    window.navigator as Navigator & { standalone?: boolean }
  ).standalone;

  if (isInstalled({ navigatorStandalone, displayModeStandalone })) {
    return "standalone";
  }

  return "browser";
}

/**
 * A home-screen web app on iOS, which is its own special case: links do not
 * leave for a browser the way they do elsewhere — iOS shows an in-app browser
 * sheet inside the web app instead — and the web app gets a WebKit data store
 * of its own, separate from Safari's. So anything that has to reach a real
 * browser needs a URL scheme, and nothing it leaves behind there comes back.
 */
export function isIosStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (detectAppPlatform() !== "standalone") return false;
  return isIosDevice(
    window.navigator.userAgent,
    window.navigator.maxTouchPoints,
  );
}
