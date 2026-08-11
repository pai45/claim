import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sourceApp = readFileSync(
  join(process.cwd(), "public/employee-benefits/app.js"),
  "utf8",
);
const styles = readFileSync(
  join(process.cwd(), "public/employee-benefits/styles.css"),
  "utf8",
);

describe("Rohan EB+ payment actions", () => {
  it("removes Scan & Pay only while Rohan's EB+ setup is pending", () => {
    expect(sourceApp).toMatch(
      /isEbPlusSetupEligible[\s\S]*activePersona === "pluspay_only" && !access\.products\.ebPlus/,
    );
    expect(styles).toMatch(
      /body\.is-pluspay\.is-eb-plus-setup-eligible \.pluspay-action-card\.is-highlight[\s\S]*display: none/,
    );
    expect(styles).toMatch(
      /body\.is-pluspay\.is-eb-plus-setup-eligible \.pluspay-actions-grid[\s\S]*grid-template-columns: minmax\(0, 1fr\)/,
    );
    expect(styles).not.toMatch(
      /body\.is-pluspay\.is-eb-plus-setup-eligible \.home-scan-card[\s\S]*display: none/,
    );
  });

  it("restores the default PlusPay actions after EB+ activation", () => {
    expect(sourceApp).toContain(
      'activePersona === "pluspay_only" && !access.products.ebPlus',
    );
    expect(styles).not.toContain("is-rohan-persona");
  });
});
