import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const html = readFileSync(
  join(process.cwd(), "public/employee-benefits/index.html"),
  "utf8",
);
const sourceApp = readFileSync(
  join(process.cwd(), "public/employee-benefits/app.js"),
  "utf8",
);

describe("EB+ wallet card identity", () => {
  it("shows the active persona without RuPay or card-number details", () => {
    expect(html).toContain("data-hero-card-persona");
    expect(html).not.toContain("hero-card-rupay");
    expect(html).not.toContain("hero-card-divider");
    expect(html).not.toContain("**** **** **** 1234");
    expect(html).not.toContain('data-lens-text="Rupay Card"');
    expect(html).not.toContain("xxxx xxxx xxxx 1234");
  });

  it("updates the cardholder when the active persona changes", () => {
    expect(sourceApp).toMatch(
      /\[data-hero-card-persona\][\s\S]*el\.textContent = upperName/,
    );
  });
});
