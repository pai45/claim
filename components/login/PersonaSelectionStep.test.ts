import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PersonaSelectionStep } from "./PersonaSelectionStep";

describe("PersonaSelectionStep", () => {
  it("renders only the three visible signed-out demo profiles", () => {
    const markup = renderToStaticMarkup(
      createElement(PersonaSelectionStep, { onSelect: vi.fn() }),
    );

    for (const name of [
      "Vishal Sharma",
      "Aarav Patel",
      "Rohan Mehta",
    ]) {
      expect(markup).toContain(name);
    }
    expect(markup).toContain("Brand New User · EB+ only");
    expect(markup).not.toContain("Rahul Verma");
    expect(markup).not.toContain("Neha Kapoor");
    expect(markup).not.toContain("Kavya Iyer");
    expect(markup.match(/role="listitem"/g)).toHaveLength(3);
  });
});
