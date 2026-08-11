import { describe, expect, it } from "vitest";
import { BENEFITS_ASSISTANT_SELECTORS, BENEFITS_ASSISTANT_STEPS, getEbHomeSteps } from "./steps";

describe("getEbHomeSteps", () => {
  it("explains the Create UPI ID call to action before one exists", () => {
    const keys = getEbHomeSteps(false).map((step) => step.key);

    expect(keys).toEqual([
      "wallet-card",
      "upi-create",
      "wallets",
      "quick-actions",
    ]);
  });

  it("splits the UPI panel into Scan and UPI ID once one is created", () => {
    const keys = getEbHomeSteps(true).map((step) => step.key);

    expect(keys).toEqual([
      "wallet-card",
      "upi-scan",
      "upi-id",
      "wallets",
      "quick-actions",
    ]);
  });

  it("keeps the UPI steps in the same slot so a paused run resumes in place", () => {
    // A client who pauses on `upi-create` and creates a UPI ID resumes at the
    // same index, which is now the first of the two replacement steps.
    expect(getEbHomeSteps(false)[1].key).toBe("upi-create");
    expect(getEbHomeSteps(true)[1].key).toBe("upi-scan");
  });
});

describe("BENEFITS_ASSISTANT_STEPS", () => {
  it("covers the four assistant sections in order", () => {
    expect(BENEFITS_ASSISTANT_STEPS.map((step) => step.key)).toEqual([
      "composer",
      "quick-chats",
      "recommended",
      "menu",
    ]);
  });

  it("has a selector for every step", () => {
    BENEFITS_ASSISTANT_STEPS.forEach((step) => {
      expect(BENEFITS_ASSISTANT_SELECTORS[step.key]).toBeTruthy();
    });
  });
});
