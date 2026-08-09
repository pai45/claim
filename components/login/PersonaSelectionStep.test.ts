import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PersonaSelectionStep } from "./PersonaSelectionStep";

describe("PersonaSelectionStep", () => {
  it("renders all five signed-out demo profiles", () => {
    const markup = renderToStaticMarkup(
      createElement(PersonaSelectionStep, { onSelect: vi.fn() }),
    );

    for (const name of [
      "Vishal Sharma",
      "Aarav Patel",
      "Neha Kapoor",
      "Rohan Mehta",
      "Kavya Iyer",
    ]) {
      expect(markup).toContain(name);
    }
    expect(markup.match(/role="listitem"/g)).toHaveLength(5);
  });
});
