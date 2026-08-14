import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  DriverSalaryFormCard,
  exceedsDriverSalaryMonthlyLimit,
} from "./DriverSalaryFormCard";

describe("DriverSalaryFormCard", () => {
  it("keeps the rupee symbol fixed before the salary input", () => {
    const html = renderToStaticMarkup(
      createElement(DriverSalaryFormCard, { onSubmit: () => undefined }),
    );

    expect(html).toContain(">\u20B9<");
    expect(html).not.toContain("Monthly driver salary limit");
  });

  it("only warns when the monthly salary exceeds ₹15,000", () => {
    expect(exceedsDriverSalaryMonthlyLimit("15,000")).toBe(false);
    expect(exceedsDriverSalaryMonthlyLimit("₹15,001")).toBe(true);
  });
});
