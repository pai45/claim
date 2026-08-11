import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PersonaSelectionStep } from "./PersonaSelectionStep";

describe("PersonaSelectionStep", () => {
  it("renders all six signed-out demo profiles", () => {
    const markup = renderToStaticMarkup(
      createElement(PersonaSelectionStep, { onSelect: vi.fn() }),
    );

    for (const name of [
      "Vishal Sharma",
      "Rahul Verma",
      "Aarav Patel",
      "Neha Kapoor",
      "Rohan Mehta",
      "Kavya Iyer",
    ]) {
      expect(markup).toContain(name);
    }
    expect(markup).toContain("Fresh Onboarding");
    expect(markup).toContain("Setup Journey");
    expect(markup.match(/role="listitem"/g)).toHaveLength(6);
  });
});
