"use client";

import { useCallback, useEffect, useState } from "react";
import { AppIcon } from "@/components/shared/AppIcon";
import {
  readSnoozedUntil,
  shouldShowInstallNudge,
  snoozeUntil,
  writeSnoozedUntil,
} from "@/lib/pwa/installNudge";

/** Long enough for the app to paint and settle before anything slides up. */
const APPEAR_DELAY_MS = 2_500;

/** The chat overlay owns the bottom of the screen while it is open. */
const CLAIMS_HASH = "#claims";

type IosNavigator = Navigator & { standalone?: boolean };

function ShareGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M12 3v11" />
      <path d="M8.5 6.5 12 3l3.5 3.5" />
      <path d="M7.5 10.5H6.5A2.5 2.5 0 0 0 4 13v5.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V13a2.5 2.5 0 0 0-2.5-2.5h-1" />
    </svg>
  );
}

function AddBoxGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className="size-4 shrink-0"
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <path d="M12 8.5v7M8.5 12h7" />
    </svg>
  );
}

/**
 * Nudges iOS users to install the app from Safari's Share sheet.
 *
 * iOS exposes no `beforeinstallprompt`, so this is instructional rather than a
 * real prompt — it cannot install anything itself. Shown at most once per
 * session, and suppressed entirely inside the native shell, in-app browsers,
 * and when the app is already on the home screen.
 */
export function AddToHomeScreenPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const iosNavigator = navigator as IosNavigator;

    const eligible = shouldShowInstallNudge({
      userAgent: navigator.userAgent,
      maxTouchPoints: navigator.maxTouchPoints,
      navigatorStandalone: iosNavigator.standalone,
      displayModeStandalone: window.matchMedia("(display-mode: standalone)")
        .matches,
      snoozedUntil: readSnoozedUntil(window.localStorage),
      now: Date.now(),
    });
    if (!eligible) return;

    const timer = window.setTimeout(() => {
      // Never cover the chat composer; there will be another page load.
      if (window.location.hash.toLowerCase() === CLAIMS_HASH) return;
      setVisible(true);
    }, APPEAR_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    writeSnoozedUntil(window.localStorage, snoozeUntil(Date.now()));
  }, []);

  useEffect(() => {
    if (!visible) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [visible, dismiss]);

  if (!visible) return null;

  return (
    <div
      // Above the chat overlay, which sits at z-index 100.
      className="animate-rise-in fixed inset-x-0 bottom-0 z-[200] flex justify-center px-page pb-[max(12px,env(safe-area-inset-bottom))]"
      role="region"
      aria-labelledby="a2hs-title"
    >
      <div className="w-full max-w-phone">
        <div className="rounded-card border border-input-border bg-surface p-4 shadow-drawer">
          <div className="flex items-start gap-3">
            <AppIcon
              src="/assets/pwa/icon-192.png"
              size={40}
              className="rounded-control"
            />
            <div className="min-w-0 flex-1">
              <p
                id="a2hs-title"
                className="font-display text-title-sm font-bold text-pine"
              >
                Add to Home Screen
              </p>
              <p className="mt-0.5 text-caption text-ink-secondary">
                Open Benefits Assistant fullscreen, without the browser bar.
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="-m-2 flex size-9 shrink-0 items-center justify-center rounded-full text-ink-secondary"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="size-4"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <ol className="mt-3 flex flex-col gap-2 rounded-control bg-surface-tint px-3 py-2.5 text-caption text-pine">
            <li className="flex items-center gap-2">
              <span className="text-ink-secondary">1.</span>
              <span>Tap</span>
              <ShareGlyph />
              <span>in the browser toolbar</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-ink-secondary">2.</span>
              <span>Choose</span>
              <AddBoxGlyph />
              <span className="font-bold">Add to Home Screen</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
