import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sourceApp = readFileSync(
  join(process.cwd(), "public/employee-benefits/app.js"),
  "utf8",
);
const html = readFileSync(
  join(process.cwd(), "public/employee-benefits/index.html"),
  "utf8",
);
const styles = readFileSync(
  join(process.cwd(), "public/employee-benefits/styles.css"),
  "utf8",
);

describe("Rohan EB+ payment actions", () => {
  it("keeps the standard Send Money and Scan & Pay cards while setup is pending", () => {
    expect(sourceApp).toMatch(
      /isEbPlusSetupEligible[\s\S]*activePersona === "pluspay_only" && !access\.products\.ebPlus/,
    );
    expect(html).toMatch(
      /class="pluspay-actions-grid"[\s\S]*data-send-money-open[\s\S]*<strong>Send Money<\/strong>[\s\S]*data-scan-pay-open[\s\S]*<strong>Scan & Pay<\/strong>/,
    );
    expect(styles).toMatch(
      /\.pluspay-actions-grid \{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/,
    );
    expect(styles).not.toMatch(
      /body\.is-pluspay\.is-eb-plus-setup-eligible \.pluspay-actions-grid/,
    );
    expect(styles).not.toMatch(
      /body\.is-pluspay\.is-eb-plus-setup-eligible \.pluspay-action-card\.is-highlight/,
    );
  });

  it("uses setup eligibility only to show or hide the EB+ invitation", () => {
    expect(styles).toMatch(
      /body\.is-pluspay \.eb-plus-setup-card[\s\S]*display: none/,
    );
    expect(styles).toMatch(
      /body\.is-pluspay\.is-eb-plus-setup-eligible \.eb-plus-setup-card[\s\S]*display: grid/,
    );
  });

  it("shows Track Card in Quick Actions only for Rohan", () => {
    expect(html).toMatch(
      /class="utility-card"[\s\S]*data-track-card-open[\s\S]*data-rohan-track-card-action[\s\S]*<strong>Track<br \/>Card<\/strong>/,
    );
    expect(sourceApp).toContain(
      'rohanTrackCardQuickAction.hidden = activePersona !== "pluspay_only"',
    );
  });
});
