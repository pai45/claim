import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { WALKTHROUGH_IDS } from "@/features/walkthrough/storage";
import { shouldAdvanceProductSwitcher } from "./ProductSwitcherWalkthrough";

const html = readFileSync(
  join(process.cwd(), "public/employee-benefits/index.html"),
  "utf8",
);
const host = readFileSync(
  join(process.cwd(), "components/host/EmployeeBenefitsHost.tsx"),
  "utf8",
);
const ebHomeWalkthrough = readFileSync(
  join(process.cwd(), "components/walkthrough/EbHomeWalkthrough.tsx"),
  "utf8",
);
const productWalkthrough = readFileSync(
  join(process.cwd(), "components/walkthrough/ProductSwitcherWalkthrough.tsx"),
  "utf8",
);

describe("Rohan product-switcher walkthrough", () => {
  it("anchors the existing top switcher and registers persistent completion", () => {
    expect(html).toMatch(
      /data-pluspay-toggle[\s\S]*data-walkthrough="product-switcher"/,
    );
    expect(WALKTHROUGH_IDS).toContain("product-switcher");
  });

  it("starts only for activated Rohan on PlusPay and remains enabled in EB+", () => {
    expect(host).toContain('persona.id === "pluspay_only"');
    expect(host).toContain("persona.access.products.ebPlus");
    expect(host).toContain("persona.access.products.plusPay");
    expect(host).toContain("startEnabled={plusPayMode}");
    expect(productWalkthrough).toContain('id: "product-switcher"');
  });

  it("advances only after the expected product transition succeeds", () => {
    expect(shouldAdvanceProductSwitcher(0, true, false)).toBe(true);
    expect(shouldAdvanceProductSwitcher(0, true, true)).toBe(false);
    expect(shouldAdvanceProductSwitcher(0, false, true)).toBe(false);
    expect(shouldAdvanceProductSwitcher(1, false, true)).toBe(true);
    expect(shouldAdvanceProductSwitcher(1, false, false)).toBe(false);
    expect(shouldAdvanceProductSwitcher(1, true, false)).toBe(false);
  });

  it("skips guidance without changing the selected product", () => {
    expect(productWalkthrough).toContain("onSkip={controller.skip}");
    expect(productWalkthrough).not.toContain("setPlusPayMode");
    expect(productWalkthrough).not.toContain("applyMode");
  });

  it("keeps iframe taps scoped to the active EB home step", () => {
    expect(ebHomeWalkthrough).toContain(
      'phaseRef.current === "running"',
    );
    expect(ebHomeWalkthrough).toContain(
      "event.data.key === activeStepKeyRef.current",
    );
  });
});
