import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DriverSalaryFormCard } from "./DriverSalaryFormCard";

describe("DriverSalaryFormCard", () => {
  it("keeps the rupee symbol fixed before the salary input and shows the limit", () => {
    const html = renderToStaticMarkup(
      createElement(DriverSalaryFormCard, { onSubmit: () => undefined }),
    );

    expect(html).toContain(">₹<");
    expect(html).toContain("Monthly driver salary limit is ₹15,000.");
    expect(html).toContain("bg-warning-tint");
  });
});
