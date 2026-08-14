import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { WALKTHROUGH_IDS } from "@/features/walkthrough/storage";
import { ROHAN_EB_PLUS_SETUP_STEPS } from "@/features/walkthrough/steps";

const html = readFileSync(
  join(process.cwd(), "public/employee-benefits/index.html"),
  "utf8",
);
const host = readFileSync(
  join(process.cwd(), "components/host/EmployeeBenefitsHost.tsx"),
  "utf8",
);
const walkthrough = readFileSync(
  join(
    process.cwd(),
    "components/walkthrough/RohanEbPlusSetupWalkthrough.tsx",
  ),
  "utf8",
);

describe("Rohan's first PlusPay EB+ setup walkthrough", () => {
  it("anchors the EB+ setup invitation and persists completion", () => {
    expect(html).toMatch(
      /data-eb-plus-setup[\s\S]*data-walkthrough="eb-plus-setup"/,
    );
    expect(WALKTHROUGH_IDS).toContain("rohan-eb-plus-setup");
    expect(walkthrough).toContain('id: "rohan-eb-plus-setup"');
  });

  it("uses concise enrollment guidance", () => {
    expect(ROHAN_EB_PLUS_SETUP_STEPS).toEqual([
      expect.objectContaining({
        key: "eb-plus-setup",
        title: "Welcome to EB+",
        body: expect.stringContaining("Complete your setup"),
      }),
    ]);
    expect(walkthrough).toContain("showHeader={false}");
  });

  it("starts only for Rohan's pending invitation on PlusPay", () => {
    expect(host).toContain('persona.id === "pluspay_only"');
    expect(host).toContain("!persona.access.products.ebPlus");
    expect(host).toContain("persona.access.products.plusPay");
    expect(host).toContain("plusPayMode &&");
    expect(host).toContain("<RohanEbPlusSetupWalkthrough");
  });
});
