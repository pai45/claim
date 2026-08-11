import { describe, expect, it } from "vitest";
import {
  PRODUCT_INTRO_LAST_INDEX,
  nextProductIntroIndex,
  previousProductIntroIndex,
  resolveProductIntroSwipe,
  shouldShowProductIntro,
} from "./controller";

describe("product intro navigation", () => {
  it("moves forward and backward without leaving the slide range", () => {
    expect(nextProductIntroIndex(0)).toBe(1);
    expect(nextProductIntroIndex(PRODUCT_INTRO_LAST_INDEX)).toBe(
      PRODUCT_INTRO_LAST_INDEX,
    );
    expect(previousProductIntroIndex(1)).toBe(0);
    expect(previousProductIntroIndex(0)).toBe(0);
  });

  it("accepts deliberate horizontal swipes", () => {
    expect(resolveProductIntroSwipe(0, -72, 8)).toBe(1);
    expect(resolveProductIntroSwipe(1, 72, 8)).toBe(0);
  });

  it("ignores short and vertical gestures", () => {
    expect(resolveProductIntroSwipe(1, -47, 0)).toBe(1);
    expect(resolveProductIntroSwipe(1, -72, 96)).toBe(1);
  });

  it("replays for both returning-account personas", () => {
    expect(shouldShowProductIntro("returning", true, false)).toBe(true);
    expect(shouldShowProductIntro("rahul_onboarding", true, false)).toBe(true);
    expect(shouldShowProductIntro("new_user", true, false)).toBe(false);
    expect(shouldShowProductIntro("new_user", false, false)).toBe(true);
    expect(shouldShowProductIntro("returning", true, true)).toBe(false);
    expect(shouldShowProductIntro("rahul_onboarding", true, true)).toBe(false);
  });
});
