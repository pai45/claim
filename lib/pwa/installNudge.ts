/**
 * Decides whether to show the iOS "Add to Home Screen" nudge.
 *
 * iOS has no `beforeinstallprompt`, so Safari cannot be asked to install a web
 * app programmatically the way Chrome can. The only route is telling the user
 * to use the Share sheet themselves, which means the timing has to be judged
 * here rather than delegated to the browser.
 */

/**
 * Holds a timestamp; the nudge stays hidden until it passes.
 *
 * This is the only thing that suppresses the nudge. There is deliberately no
 * per-session flag: `sessionStorage` survives an in-tab reload, so gating on it
 * would mean a refresh never re-showed the nudge. Every fresh page load is a
 * chance to show it, and dismissing is what buys quiet.
 */
export const NUDGE_SNOOZE_KEY = "eb-claims:a2hs-snoozed-until";
/** How long an explicit dismissal suppresses the nudge. */
export const NUDGE_SNOOZE_DAYS = 14;

/**
 * Appended to the WebView user agent by the Expo shell in `mobile/`. Inside the
 * native app the page is already "installed", so the nudge would be nonsense.
 */
export const NATIVE_SHELL_UA_MARKER = "BenefitsAssistantApp";

/** Embedded browsers with no Share → Add to Home Screen affordance. */
const IN_APP_BROWSER =
  /FBAN|FBAV|FB_IAB|Instagram|LinkedInApp|Line\/|MicroMessenger|Snapchat|Pinterest/i;

/**
 * iPadOS 13+ reports a desktop Mac user agent, so touch points are what
 * separates an iPad from an actual Mac.
 */
export function isIosDevice(userAgent: string, maxTouchPoints: number): boolean {
  if (/iPhone|iPod|iPad/i.test(userAgent)) return true;
  return /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
}

export function isNativeShell(userAgent: string): boolean {
  return userAgent.includes(NATIVE_SHELL_UA_MARKER);
}

export function isInAppBrowser(userAgent: string): boolean {
  return IN_APP_BROWSER.test(userAgent);
}

/**
 * `navigator.standalone` is the iOS-specific signal; the media query is the
 * standard one. Either being true means the app is already on the home screen.
 */
export function isInstalled(input: {
  navigatorStandalone?: boolean;
  displayModeStandalone?: boolean;
}): boolean {
  return Boolean(input.navigatorStandalone || input.displayModeStandalone);
}

export type InstallNudgeInput = {
  userAgent: string;
  maxTouchPoints: number;
  navigatorStandalone?: boolean;
  displayModeStandalone?: boolean;
  /** Timestamp from a previous dismissal, if any. */
  snoozedUntil: number | null;
  now: number;
};

export function shouldShowInstallNudge(input: InstallNudgeInput): boolean {
  if (!isIosDevice(input.userAgent, input.maxTouchPoints)) return false;
  // The Expo shell already is the installed app.
  if (isNativeShell(input.userAgent)) return false;
  // Advice to use a Share sheet that does not exist would only confuse.
  if (isInAppBrowser(input.userAgent)) return false;
  if (isInstalled(input)) return false;
  if (input.snoozedUntil !== null && input.now < input.snoozedUntil) return false;
  return true;
}

export function snoozeUntil(now: number, days = NUDGE_SNOOZE_DAYS): number {
  return now + days * 24 * 60 * 60 * 1000;
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** Storage access is wrapped because private browsing can make it throw. */
export function readSnoozedUntil(storage: StorageLike): number | null {
  try {
    const raw = storage.getItem(NUDGE_SNOOZE_KEY);
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeSnoozedUntil(storage: StorageLike, value: number): void {
  try {
    storage.setItem(NUDGE_SNOOZE_KEY, String(value));
  } catch {
    // Nothing to do; the nudge simply reappears on the next load.
  }
}
