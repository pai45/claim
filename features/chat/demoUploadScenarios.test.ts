import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateClaimPrecheck } from "@/lib/claims/precheck";
import {
  BILL_UPLOAD_SCENARIOS,
  DL_UPLOAD_SCENARIOS,
  buildBillExtractFromScenario,
  buildDlPayloadFromScenario,
  getBillUploadScenario,
  getBillUploadScenariosForSource,
  getDemoPrecheckDate,
} from "./demoUploadScenarios";
import type { BillUploadScenarioId } from "./types";

function precheck(id: BillUploadScenarioId) {
  const extract = buildBillExtractFromScenario(id);
  return evaluateClaimPrecheck(extract, getDemoPrecheckDate(extract));
}

describe("demo document upload scenarios", () => {
  it("registers 11 unique bill scenarios and two unique DL scenarios", () => {
    expect(BILL_UPLOAD_SCENARIOS).toHaveLength(11);
    expect(new Set(BILL_UPLOAD_SCENARIOS.map(({ id }) => id)).size).toBe(11);
    expect(DL_UPLOAD_SCENARIOS).toHaveLength(2);
    expect(new Set(DL_UPLOAD_SCENARIOS.map(({ id }) => id)).size).toBe(2);
  });

  it("points every scenario at a project asset", () => {
    const assets = [
      ...BILL_UPLOAD_SCENARIOS.map(({ asset }) => asset),
      ...DL_UPLOAD_SCENARIOS.map(({ asset }) => asset),
    ];
    expect(new Set(assets).size).toBe(13);
    for (const asset of assets) {
      expect(existsSync(join(process.cwd(), "public", asset))).toBe(true);
    }
  });

  it("removes the missing meal bill from Camera while keeping other sources intact", () => {
    expect(
      getBillUploadScenariosForSource("camera").map(({ id }) => id),
    ).not.toContain("meal_missing");
    expect(
      getBillUploadScenariosForSource("pdf").map(({ id }) => id),
    ).toContain("meal_missing");
    expect(
      getBillUploadScenariosForSource("gallery").map(({ id }) => id),
    ).toContain("meal_missing");
  });

  it.each([
    "driver_salary",
    "fuel",
    "internet",
    "mobile",
    "books",
    "professional",
  ] as const)("makes %s a passing claim", (id) => {
    expect(precheck(id).status).toBe("pass");
  });

  it("blocks missing meal fields and opens manual review", () => {
    const extract = buildBillExtractFromScenario("meal_missing");
    expect(extract.manualReview).toBe(true);
    expect(precheck("meal_missing").status).toBe("blocked");
  });

  it("blocks a fuel bill that exceeds the available balance", () => {
    const result = precheck("fuel_exceeding");
    expect(result.status).toBe("blocked");
    expect(result.checks.find(({ id }) => id === "allowance")?.status).toBe(
      "blocked",
    );
  });

  it("warns for a duplicate and requires acknowledgement", () => {
    const result = precheck("duplicate");
    expect(result.status).toBe("warning");
    expect(result.checks.find(({ id }) => id === "duplicate")?.status).toBe(
      "warning",
    );
    expect(result.requiresAcknowledgement).toBe(true);
  });

  it("blocks the late bill using the fixed demo clock", () => {
    const scenario = getBillUploadScenario("late");
    expect(scenario.referenceNow).toContain("2026-08-07");
    const result = precheck("late");
    expect(result.status).toBe("blocked");
    expect(result.checks.find(({ id }) => id === "deadline")?.status).toBe(
      "blocked",
    );
  });

  it("warns when the category needs HR review", () => {
    const result = precheck("other");
    expect(result.status).toBe("warning");
    expect(result.requiresAcknowledgement).toBe(true);
  });

  it("models DL found and DL data not found as actionable states", () => {
    const found = buildDlPayloadFromScenario("dl_found");
    const notFound = buildDlPayloadFromScenario("dl_not_found");
    expect(found.dlNumber).toBe("DL-1420110012345");
    expect(found.dlPreviewAsset).toBeTruthy();
    expect(notFound.dlNumber).toBeUndefined();
    expect(notFound.dlWarning).toContain("Enter it manually");
    expect(notFound.dlError).toBeUndefined();
  });
});
