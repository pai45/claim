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
  it("shows the active persona above the RuPay mark and masked number", () => {
    expect(html).toMatch(
      /data-hero-card-persona[\s\S]*assets\/icons\/rupay-logo\.svg[\s\S]*hero-card-divider[\s\S]*\*\*\*\* \*\*\*\* \*\*\*\* 1234/,
    );
    expect(html).not.toContain('data-lens-text="Rupay Card"');
    expect(html).not.toContain("xxxx xxxx xxxx 1234");
  });

  it("updates the cardholder when the active persona changes", () => {
    expect(sourceApp).toMatch(
      /\[data-hero-card-persona\][\s\S]*el\.textContent = upperName/,
    );
  });
});
