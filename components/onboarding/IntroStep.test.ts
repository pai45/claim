import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { IntroStep } from "./IntroStep";

describe("IntroStep", () => {
  it("shows the benefits consent checked by default above an enabled CTA", () => {
    const markup = renderToStaticMarkup(
      createElement(IntroStep, { onContinue: vi.fn() }),
    );

    expect(markup).toContain('type="checkbox"');
    expect(markup).toContain('checked=""');
    expect(markup).toContain("Infosys Terms and Conditions");
    expect(markup).toContain("Privacy Policy");
    expect(markup).toContain("rounded-checkbox");
    expect(markup).toContain(">Activate Benefits Program</button>");
    expect(markup).not.toContain("disabled=\"\"");
  });

  it("renders a back navigation control when an exit handler is supplied", () => {
    const markup = renderToStaticMarkup(
      createElement(IntroStep, { onContinue: vi.fn(), onBack: vi.fn() }),
    );

    expect(markup).toContain('aria-label="Back to Employee Benefits"');
  });
});
