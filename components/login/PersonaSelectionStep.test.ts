import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PersonaSelectionStep } from "./PersonaSelectionStep";

describe("PersonaSelectionStep", () => {
  it("renders only the three visible signed-out demo profiles", () => {
    const markup = renderToStaticMarkup(
      createElement(PersonaSelectionStep, { onSelect: vi.fn() }),
    );

    const profileNames = [
      "Aarav Patel",
      "Rohan Mehta",
      "Vishal Sharma",
    ];

    for (const name of profileNames) {
      expect(markup).toContain(name);
    }
    expect(profileNames.map((name) => markup.indexOf(name))).toEqual(
      [...profileNames]
        .map((name) => markup.indexOf(name))
        .sort((left, right) => left - right),
    );
    expect(markup).toContain("New user · EB+ only");
    expect(markup).toContain("Existing user of Expense · New user EB+");
    expect(markup).toContain("Returning user · EB+ &amp; Expense");
    expect(markup).not.toContain("Rahul Verma");
    expect(markup).not.toContain("Neha Kapoor");
    expect(markup).not.toContain("Kavya Iyer");
    expect(markup.match(/role="listitem"/g)).toHaveLength(3);
  });
});
