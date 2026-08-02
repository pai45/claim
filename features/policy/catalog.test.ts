import { describe, expect, it } from "vitest";
import { CLAIM_CATEGORIES } from "@/features/chat/constants";
import {
  AVAILABLE_LIMIT,
  DASHBOARD_CATEGORIES,
  FY_LIMIT,
  UTILIZED_AMOUNT,
} from "@/features/dashboard/constants";
import {
  EMPLOYER_BENEFITS_CATALOG,
  POLICY_LIST_ITEMS,
} from "./constants";

describe("employer benefits catalog", () => {
  it("derives policy, dashboard, and claim metadata from one catalog", () => {
    expect(POLICY_LIST_ITEMS).toHaveLength(
      EMPLOYER_BENEFITS_CATALOG.benefits.length,
    );
    expect(DASHBOARD_CATEGORIES).toEqual(
      EMPLOYER_BENEFITS_CATALOG.benefits
        .filter((benefit) => benefit.display.dashboardEnabled)
        .map((benefit) =>
          expect.objectContaining({
            id: benefit.id,
            name: benefit.display.label,
            amount: benefit.balance.available,
          }),
        ),
    );
    for (const benefit of EMPLOYER_BENEFITS_CATALOG.benefits) {
      if (benefit.id !== "driver") {
        expect(CLAIM_CATEGORIES).toContain(benefit.display.label);
      }
    }
  });

  it("calculates dashboard totals from category balances", () => {
    expect(AVAILABLE_LIMIT).toBe(
      DASHBOARD_CATEGORIES.reduce((sum, item) => sum + item.amount, 0),
    );
    expect(UTILIZED_AMOUNT).toBe(
      DASHBOARD_CATEGORIES.reduce((sum, item) => sum + item.utilized, 0),
    );
    expect(FY_LIMIT).toBe(
      DASHBOARD_CATEGORIES.reduce((sum, item) => sum + item.allocation, 0),
    );
  });

  it("contains only qualified tax-treatment language", () => {
    const content = JSON.stringify(EMPLOYER_BENEFITS_CATALOG).toLowerCase();
    for (const forbidden of [
      "fully tax-exempt",
      "save up to 30%",
      "credited tax-free",
      "exempted from your taxable income",
      "reduce your taxable income",
    ]) {
      expect(content).not.toContain(forbidden);
    }
    for (const benefit of EMPLOYER_BENEFITS_CATALOG.benefits) {
      expect(benefit.taxTreatment.qualifier).toContain("applicable tax regime");
      expect(benefit.taxTreatment.disclaimer).toBe(
        "This is policy guidance, not tax advice.",
      );
    }
  });

  it("describes truthful local-demo privacy behavior", () => {
    expect(EMPLOYER_BENEFITS_CATALOG.privacy).toMatchObject({
      retentionDays: 7,
      processingLocation: "device",
      originalFilesPersisted: false,
      rawOcrPersisted: false,
      recipients: [],
      demoSubmissionOnly: true,
    });
  });
});
