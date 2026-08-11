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
const host = readFileSync(
  join(process.cwd(), "components/host/EmployeeBenefitsHost.tsx"),
  "utf8",
);

describe("Rohan EB+ setup bridge", () => {
  it("renders the invitation with the supplied artwork and CTA", () => {
    expect(html).toContain("Complete Your EB+ Setup");
    expect(html).toContain("Start your EB+ journey");
    expect(html).toContain("assets/pluspay/eb-setup-illustration.svg");
  });

  it("uses one dedicated source-to-host message contract", () => {
    const message = "employee-benefits:start-eb-plus-setup";
    expect(sourceApp).toContain(message);
    expect(host).toContain(message);
    expect(sourceApp).toContain("is-eb-plus-setup-eligible");
  });

  it("lands on EB+ after completion while keeping exit on PlusPay", () => {
    expect(host).toMatch(
      /const completeEbPlusSetup[\s\S]*setPlusPayMode\(false\)[\s\S]*setEbPlusSetupOpen\(false\)/,
    );
    expect(host).toContain("onExit={closeEbPlusSetup}");
    expect(host).toContain("onComplete={completeEbPlusSetup}");
  });
});
