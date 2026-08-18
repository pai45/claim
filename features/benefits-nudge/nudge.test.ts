import { describe, expect, it } from "vitest";
import type { BenefitsNudgeGate } from "./nudge";
import {
  BENEFITS_NUDGE_SHOWN_KEY,
  markNudgeShown,
  readNudgeShown,
  shouldArmBenefitsNudge,
} from "./nudge";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
}

const ARMED: BenefitsNudgeGate = {
  personaId: "returning",
  surfaceClear: true,
  plusPayMode: false,
  frameReady: true,
  alreadyShown: false,
};

describe("shouldArmBenefitsNudge", () => {
  it("arms for a returning user sitting on an unobstructed EB+ home", () => {
    expect(shouldArmBenefitsNudge(ARMED)).toBe(true);
  });

  it("stays out of every other persona's way", () => {
    // new_user has the eb-home walkthrough, whose last step is this same button.
    expect(
      shouldArmBenefitsNudge({ ...ARMED, personaId: "new_user" }),
    ).toBe(false);
    expect(
      shouldArmBenefitsNudge({ ...ARMED, personaId: "pluspay_only" }),
    ).toBe(false);
    expect(
      shouldArmBenefitsNudge({ ...ARMED, personaId: "ebPlus_only" }),
    ).toBe(false);
  });

  it("does not point at Scan & Pay", () => {
    expect(shouldArmBenefitsNudge({ ...ARMED, plusPayMode: true })).toBe(false);
  });

  it("waits for an unobstructed, settled surface", () => {
    expect(shouldArmBenefitsNudge({ ...ARMED, surfaceClear: false })).toBe(
      false,
    );
    expect(shouldArmBenefitsNudge({ ...ARMED, frameReady: false })).toBe(false);
  });

  it("shows at most once per session", () => {
    expect(shouldArmBenefitsNudge({ ...ARMED, alreadyShown: true })).toBe(false);
  });
});

describe("benefits nudge storage", () => {
  it("records that the nudge has been shown", () => {
    const storage = memoryStorage();

    expect(readNudgeShown(storage)).toBe(false);
    markNudgeShown(storage);
    expect(storage.getItem(BENEFITS_NUDGE_SHOWN_KEY)).toBe("true");
    expect(readNudgeShown(storage)).toBe(true);
  });

  it("stays quiet when browser storage is unavailable", () => {
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

    expect(() => markNudgeShown(blocked)).not.toThrow();
    // Unreadable storage cannot prove the nudge is unseen, so it stays away.
    expect(readNudgeShown(blocked)).toBe(true);
  });
});
