import { describe, expect, it } from "vitest";
import {
  BENEFITS_ASSISTANT_SELECTORS,
  BENEFITS_ASSISTANT_STEPS,
  EB_HOME_HOST_SELECTORS,
  EB_HOME_POST_UPI_STEP_INDEX,
  PRODUCT_SWITCHER_STEPS,
  getEbHomeSteps,
} from "./steps";

describe("getEbHomeSteps", () => {
  it("explains the Create UPI ID call to action before one exists", () => {
    const keys = getEbHomeSteps(false).map((step) => step.key);

    expect(keys).toEqual([
      "wallet-card",
      "upi-create",
      "wallets",
      "quick-actions",
      "benefits-nav",
    ]);
  });

  it("appends Scan & Pay and the created UPI ID once setup completes", () => {
    const keys = getEbHomeSteps(true).map((step) => step.key);

    expect(keys).toEqual([
      "wallet-card",
      "upi-create",
      "wallets",
      "quick-actions",
      "benefits-nav",
      "upi-scan",
      "upi-id",
    ]);
  });

  it("keeps Benefits fifth and the post-setup steps sixth and seventh", () => {
    const beforeSetup = getEbHomeSteps(false);
    const afterSetup = getEbHomeSteps(true);

    expect(beforeSetup[4].key).toBe("benefits-nav");
    expect(afterSetup[4].key).toBe("benefits-nav");
    expect(afterSetup.slice(5).map((step) => step.key)).toEqual([
      "upi-scan",
      "upi-id",
    ]);
    expect(afterSetup[EB_HOME_POST_UPI_STEP_INDEX].key).toBe("upi-scan");
    expect(EB_HOME_HOST_SELECTORS[afterSetup[4].key]).toBeTruthy();
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

describe("PRODUCT_SWITCHER_STEPS", () => {
  it("guides Rohan to PlusPay and back through the same target", () => {
    expect(PRODUCT_SWITCHER_STEPS).toEqual([
      {
        key: "product-switcher",
        eyebrow: "Product switcher",
        title: "Your PlusPay is still here",
        body: "Tap the highlighted switch to move from your new EB+ account to PlusPay.",
        advanceOn: "target",
      },
      {
        key: "product-switcher",
        eyebrow: "Product switcher",
        title: "Return to EB+",
        body: "Use the same switch anytime. Tap it again to return to your EB+ benefits.",
        advanceOn: "target",
      },
    ]);
  });
});
