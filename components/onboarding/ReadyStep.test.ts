import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { createEbPlusActivationState } from "@/features/onboarding/ebPlusActivation";
import { ReadyStep } from "./CardSteps";

describe("ReadyStep", () => {
  it("shows Rohan's completed benefits card and final homepage action", () => {
    const state = createEbPlusActivationState();
    const markup = renderToStaticMarkup(
      createElement(ReadyStep, {
        state: {
          ...state,
          identityDone: true,
          cardSetupDone: true,
          step: "ready",
        },
        onToggleOnline: vi.fn(),
        onToggleTap: vi.fn(),
        onFinish: vi.fn(),
      }),
    );

    expect(markup).toContain(
      "Your Employee Benefit Card is Ready for Use!",
    );
    expect(markup).toContain("ROHAN MEHTA");
    expect(markup).toContain("**** **** **** ***");
    expect(markup).toContain("** / **");
    expect(markup).toContain("rupay-logo.svg");
    expect(markup).toContain("icici-card-front.png");
    expect(markup).toContain("online-transactions.svg");
    expect(markup).toContain("tap-to-pay.svg");
    expect(markup).toContain("Linked Wallets");
    expect(markup).toContain(
      "You can change these anytime in Card Settings.",
    );
    expect(markup).toContain(">Go to Homepage</button>");
  });
});
