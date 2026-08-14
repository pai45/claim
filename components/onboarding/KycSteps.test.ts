import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { KycIntroStep, KycProgressOverlay } from "./KycSteps";

describe("KYC progress visibility", () => {
  it("does not render the progress overlay while it is closed", () => {
    const markup = renderToStaticMarkup(
      createElement(KycProgressOverlay, {
        open: false,
        onDismiss: vi.fn(),
        onComplete: vi.fn(),
      }),
    );

    expect(markup).toBe("");
    expect(markup).not.toContain("KYC Verification in Progress");
  });

  it("offers the direct completion shortcut before the browser handoff starts", () => {
    const markup = renderToStaticMarkup(
      createElement(KycIntroStep, {
        awaitingReturn: false,
        onStart: vi.fn(),
        onCompleted: vi.fn(),
      }),
    );

    expect(markup).toContain("Ready? Let&#x27;s begin KYC in browser.");
    expect(markup).toContain("I&#x27;ve completed my KYC");
  });

  it("offers KYC completion only after the browser handoff starts", () => {
    const markup = renderToStaticMarkup(
      createElement(KycIntroStep, {
        awaitingReturn: true,
        onStart: vi.fn(),
        onCompleted: vi.fn(),
      }),
    );

    expect(markup).toContain("Reopen KYC tab");
    expect(markup).toContain("I&#x27;ve completed my KYC");
  });
});
