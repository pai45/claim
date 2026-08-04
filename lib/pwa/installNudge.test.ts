import { describe, expect, it } from "vitest";
import {
  NUDGE_SNOOZE_KEY,
  isIosDevice,
  readSnoozedUntil,
  shouldShowInstallNudge,
  snoozeUntil,
  writeSnoozedUntil,
  type InstallNudgeInput,
} from "./installNudge";

const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
const IPAD_OS =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15";
const ANDROID_CHROME =
  "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
const NATIVE_SHELL = `${IPHONE_SAFARI} BenefitsAssistantApp/1.0`;
const INSTAGRAM = `${IPHONE_SAFARI} Instagram 300.0.0.0`;

function input(overrides: Partial<InstallNudgeInput> = {}): InstallNudgeInput {
  return {
    userAgent: IPHONE_SAFARI,
    maxTouchPoints: 5,
    snoozedUntil: null,
    now: 1_000,
    ...overrides,
  };
}

function fakeStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("isIosDevice", () => {
  it("detects an iPhone", () => {
    expect(isIosDevice(IPHONE_SAFARI, 5)).toBe(true);
  });

  it("detects iPadOS, which reports a desktop Mac user agent", () => {
    expect(isIosDevice(IPAD_OS, 5)).toBe(true);
  });

  it("does not mistake a real Mac for an iPad", () => {
    expect(isIosDevice(IPAD_OS, 0)).toBe(false);
  });

  it("rejects Android", () => {
    expect(isIosDevice(ANDROID_CHROME, 5)).toBe(false);
  });
});

describe("shouldShowInstallNudge", () => {
  it("shows on a fresh load in iOS Safari", () => {
    expect(shouldShowInstallNudge(input())).toBe(true);
  });

  it("shows again on a refresh, since only a dismissal suppresses it", () => {
    expect(shouldShowInstallNudge(input())).toBe(true);
    expect(shouldShowInstallNudge(input({ now: 2_000 }))).toBe(true);
  });

  it("never shows inside the native Expo shell", () => {
    expect(shouldShowInstallNudge(input({ userAgent: NATIVE_SHELL }))).toBe(
      false,
    );
  });

  it("never shows in an in-app browser with no Share sheet", () => {
    expect(shouldShowInstallNudge(input({ userAgent: INSTAGRAM }))).toBe(false);
  });

  it("does not nag when already added to the home screen", () => {
    expect(shouldShowInstallNudge(input({ navigatorStandalone: true }))).toBe(
      false,
    );
    expect(
      shouldShowInstallNudge(input({ displayModeStandalone: true })),
    ).toBe(false);
  });

  it("respects an active snooze, then returns once it lapses", () => {
    expect(
      shouldShowInstallNudge(input({ now: 500, snoozedUntil: 1_000 })),
    ).toBe(false);
    expect(
      shouldShowInstallNudge(input({ now: 1_500, snoozedUntil: 1_000 })),
    ).toBe(true);
  });

  it("does not show on Android, which has a real install prompt", () => {
    expect(shouldShowInstallNudge(input({ userAgent: ANDROID_CHROME }))).toBe(
      false,
    );
  });
});

describe("snooze persistence", () => {
  it("round-trips a snooze timestamp", () => {
    const storage = fakeStorage();
    const until = snoozeUntil(0, 14);
    writeSnoozedUntil(storage, until);
    expect(readSnoozedUntil(storage)).toBe(until);
    expect(until).toBe(14 * 24 * 60 * 60 * 1000);
  });

  it("treats absent or corrupt values as no snooze", () => {
    const storage = fakeStorage();
    expect(readSnoozedUntil(storage)).toBeNull();
    storage.setItem(NUDGE_SNOOZE_KEY, "not-a-number");
    expect(readSnoozedUntil(storage)).toBeNull();
  });

  it("survives storage that throws, as in private browsing", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    expect(readSnoozedUntil(blocked)).toBeNull();
    expect(() => writeSnoozedUntil(blocked, 1)).not.toThrow();
  });
});
