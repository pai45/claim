import { describe, expect, it } from "vitest";
import {
  APP_DOWNLOAD_DURATION_MS,
  APP_SPLASH_DURATION_MS,
  downloadProgress,
  initialInstallJourneyState,
  installJourneyReducer,
  shouldShowInstallJourney,
} from "./controller";

describe("Aarav app-install journey", () => {
  it("uses the requested download and splash durations", () => {
    expect(APP_DOWNLOAD_DURATION_MS).toBe(4_000);
    // Covers the splash logo animation end to end; see the constant's comment.
    expect(APP_SPLASH_DURATION_MS).toBe(2_600);
  });

  it("clamps elapsed download progress to the supported range", () => {
    expect(downloadProgress(-500)).toBe(0);
    expect(downloadProgress(2_000)).toBe(50);
    expect(downloadProgress(4_000)).toBe(100);
    expect(downloadProgress(9_000)).toBe(100);
    expect(downloadProgress(Number.NaN)).toBe(0);
  });

  it("moves through store, downloading, installed, and splash in order", () => {
    let state = installJourneyReducer(initialInstallJourneyState, {
      type: "open-store",
    });
    expect(state).toEqual({ phase: "store", progress: 0 });

    state = installJourneyReducer(state, { type: "start-download" });
    state = installJourneyReducer(state, {
      type: "sync-download",
      elapsedMs: 2_000,
    });
    expect(state).toEqual({ phase: "downloading", progress: 50 });

    state = installJourneyReducer(state, {
      type: "sync-download",
      elapsedMs: APP_DOWNLOAD_DURATION_MS,
    });
    expect(state).toEqual({ phase: "installed", progress: 100 });

    state = installJourneyReducer(state, { type: "open-app" });
    expect(state).toEqual({ phase: "splash", progress: 100 });
  });

  it("prevents the app from opening before installation completes", () => {
    const store = installJourneyReducer(initialInstallJourneyState, {
      type: "open-store",
    });
    expect(installJourneyReducer(store, { type: "open-app" })).toBe(store);

    const downloading = installJourneyReducer(store, {
      type: "start-download",
    });
    expect(installJourneyReducer(downloading, { type: "open-app" })).toBe(
      downloading,
    );
  });

  it("returns from any store state to a fresh WhatsApp message", () => {
    const installed = {
      phase: "installed",
      progress: 100,
    } as const;
    expect(
      installJourneyReducer(installed, { type: "back-to-whatsapp" }),
    ).toEqual(initialInstallJourneyState);
  });

  it("shows the pre-intro journey only for a fresh Aarav selection", () => {
    expect(shouldShowInstallJourney("new_user", false)).toBe(true);
    expect(shouldShowInstallJourney("new_user", true)).toBe(false);
    expect(shouldShowInstallJourney("returning", false)).toBe(false);
    expect(shouldShowInstallJourney("pluspay_only", false)).toBe(false);
    expect(shouldShowInstallJourney(null, false)).toBe(false);
  });
});
