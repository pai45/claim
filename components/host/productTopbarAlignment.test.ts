import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sourceStyles = readFileSync(
  join(process.cwd(), "public/employee-benefits/styles.css"),
  "utf8",
);

describe("EB+ and PlusPay topbar alignment", () => {
  it("keeps both product modes on the shared topbar geometry", () => {
    expect(sourceStyles).toMatch(
      /\.topbar-row\s*\{[\s\S]*?grid-template-columns:\s*44px minmax\(0, 1fr\) 44px;[\s\S]*?min-height:\s*88px;/,
    );
    expect(sourceStyles).not.toMatch(/body\.is-pluspay \.topbar-row\s*\{/);
    expect(sourceStyles).not.toMatch(
      /body\.is-pluspay \.avatar-button\s*\{[^}]*\b(?:width|height):/,
    );
    expect(sourceStyles).not.toMatch(/body\.is-pluspay \.topbar-spacer\s*\{/);
  });
});
