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
import { detectAppPlatform, isIosStandalone } from "@/lib/pwa/platform";

export const VKYC_DONE_KEY = "eb-claims:vkyc-demo-done";
export const VKYC_ROUTE_KEY = "eb-claims:vkyc-handoff-route";

/** `next.config.ts` sets `trailingSlash: true`, so the slash is not optional. */
export const VKYC_PATH = "/vkyc/";

/** How long to give a URL scheme before deciding no app answered it. */
export const SCHEME_TIMEOUT_MS = 1000;

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type HandoffRoute =
  /** Left for a separate app — the native shell's browser, or an iOS browser app. */
  | "external-app"
  /** A real second tab in this same browser. */
  | "new-tab"
  /** `window.open` was blocked; this tab navigated instead. */
  | "same-tab";

export function buildVkycUrl(): string {
  return new URL(withBasePath(VKYC_PATH), window.location.origin).toString();
}

/**
 * Chrome for iOS answers to `googlechrome:` / `googlechromes:`, which is the
 * only public way to hand a URL to it rather than to whatever browser view the
 * current app happens to provide.
 */
export function chromeSchemeUrl(url: string): string {
  return url
    .replace(/^https:/i, "googlechromes:")
    .replace(/^http:/i, "googlechrome:");
}

/**
 * Undocumented, but the only thing that forces Safari out of an iOS web app —
 * and Safari, unlike Chrome, is always installed.
 */
export function safariSchemeUrl(url: string): string {
  return `x-safari-${url}`;
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

function rememberRoute(
  route: HandoffRoute,
  storage: StorageLike = window.localStorage,
): void {
  try {
    storage.setItem(VKYC_ROUTE_KEY, route);
  } catch {
    // `handoffFlagCanCross` falls back to the platform when this is missing.
  }
}

export function readHandoffRoute(
  storage: StorageLike = window.localStorage,
): HandoffRoute | null {
  try {
    const raw = storage.getItem(VKYC_ROUTE_KEY);
    return raw === "external-app" || raw === "new-tab" || raw === "same-tab"
      ? raw
      : null;
  } catch {
    return null;
  }
}

export function clearVkycHandoff(
  storage: StorageLike = window.localStorage,
): void {
  clearVkycDone(storage);
  try {
    storage.removeItem(VKYC_ROUTE_KEY);
  } catch {
    // Same as above — a stale route is overwritten by the next hand-off.
  }
}

/**
 * Whether the "finished" flag can travel back from wherever the demo was
 * opened. It can only do so within one browser's storage for this origin, so
 * anything that left for a separate app is a no.
 */
export function handoffFlagCanCross(
  storage: StorageLike = window.localStorage,
): boolean {
  const route = readHandoffRoute(storage);
  if (route) return route !== "external-app";
  // No record — storage is blocked, or the wait predates this being written.
  // Fall back to the two platforms that are known not to share storage.
  return detectAppPlatform() !== "native-shell" && !isIosStandalone();
}

/**
 * Call this synchronously from the click handler. Deferring it behind an await
 * or a state update costs the user-gesture flag and the popup is blocked.
 */
export function openVkycDemo(): HandoffRoute {
  clearVkycHandoff();
  const url = buildVkycUrl();

  if (detectAppPlatform() === "native-shell") {
    // `window.open` is not an option here: Android WebView leaves it to
    // `onOpenWindow`, and a plain navigation would be swallowed by the shell's
    // `isInternalUrl` check and load the page *inside* the WebView.
    rememberRoute("external-app");
    window.ReactNativeWebView?.postMessage(
      JSON.stringify({ type: "open-external", url }),
    );
    return "external-app";
  }

  if (isIosStandalone()) {
    // `window.open` here gets an in-app browser sheet layered over the web app,
    // which is not "opening the browser" in any sense the user would recognise.
    // A URL scheme is the only way out to a real browser app.
    rememberRoute("external-app");
    openViaIosBrowserApp(url);
    return "external-app";
  }

  const opened = window.open(url, "_blank", "noopener");
  if (opened) {
    rememberRoute("new-tab");
    return "new-tab";
  }

  // Blocked. The waiting state is already persisted, so leaving this tab is
  // recoverable — the browser back button lands back on the KYC screen.
  rememberRoute("same-tab");
  window.location.assign(url);
  return "same-tab";
}

/**
 * Walks a list of ways out of an iOS web app, best first, stopping as soon as
 * one of them takes. iOS gives no success callback for a scheme that nothing
 * handles, so "did it work" has to be inferred from the app still being on
 * screen a moment later.
 */
function openViaIosBrowserApp(url: string): void {
  const attempts = [
    chromeSchemeUrl(url),
    safariSchemeUrl(url),
    // Last resort. Not a separate browser, but better than a dead button.
    url,
  ];
  let timer = 0;

  const stop = () => {
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };

  const onVisibilityChange = () => {
    // Going hidden means a browser app took over. Anything after this point is
    // the user coming back, who must not be navigated away again.
    if (document.visibilityState === "hidden") stop();
  };

  const attempt = (index: number) => {
    const startedAt = Date.now();
    window.location.href = attempts[index];

    if (index >= attempts.length - 1) {
      stop();
      return;
    }

    timer = window.setTimeout(() => {
      // iOS freezes timers in the background, so a callback that arrives far
      // later than it was scheduled for means the app *was* backgrounded and
      // the scheme did open something.
      if (Date.now() - startedAt > SCHEME_TIMEOUT_MS * 2) {
        stop();
        return;
      }
      if (document.visibilityState !== "visible") {
        stop();
        return;
      }
      attempt(index + 1);
    }, SCHEME_TIMEOUT_MS);
  };

  document.addEventListener("visibilitychange", onVisibilityChange);
  attempt(0);
}
