import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateClaimPrecheck } from "@/lib/claims/precheck";
import {
  CLAIM_UPLOAD_SCENARIOS,
  DL_UPLOAD_SCENARIOS,
  buildClaimExtractFromScenario,
  buildDlPayloadFromScenario,
  getClaimUploadScenario,
  getClaimUploadScenariosForSource,
  getDemoPrecheckDate,
} from "./demoUploadScenarios";
import type { ClaimUploadScenarioId } from "./types";

function precheck(id: ClaimUploadScenarioId) {
  const extract = buildClaimExtractFromScenario(id);
  return evaluateClaimPrecheck(extract, getDemoPrecheckDate(extract));
}

describe("demo document upload scenarios", () => {
  it("registers 11 unique claim scenarios and two unique DL scenarios", () => {
    expect(CLAIM_UPLOAD_SCENARIOS).toHaveLength(11);
    expect(new Set(CLAIM_UPLOAD_SCENARIOS.map(({ id }) => id)).size).toBe(11);
    expect(DL_UPLOAD_SCENARIOS).toHaveLength(2);
    expect(new Set(DL_UPLOAD_SCENARIOS.map(({ id }) => id)).size).toBe(2);
  });

  it("points every scenario at a project asset", () => {
    const assets = [
      ...CLAIM_UPLOAD_SCENARIOS.map(({ asset }) => asset),
      ...DL_UPLOAD_SCENARIOS.map(({ asset }) => asset),
    ];
    expect(new Set(assets).size).toBe(13);
    for (const asset of assets) {
      expect(existsSync(join(process.cwd(), "public", asset))).toBe(true);
    }
  });

  it("removes the missing meal claim from Camera while keeping other sources intact", () => {
    expect(
      getClaimUploadScenariosForSource("camera").map(({ id }) => id),
    ).not.toContain("meal_missing");
    expect(
      getClaimUploadScenariosForSource("pdf").map(({ id }) => id),
    ).toContain("meal_missing");
    expect(
      getClaimUploadScenariosForSource("gallery").map(({ id }) => id),
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
    const extract = buildClaimExtractFromScenario("meal_missing");
    expect(extract.manualReview).toBe(true);
    expect(precheck("meal_missing").status).toBe("blocked");
  });

  it("blocks a fuel claim that exceeds the available balance", () => {
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

  it("blocks the late claim using the fixed demo clock", () => {
    const scenario = getClaimUploadScenario("late");
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
    expect(found.driverName).toBe("Ramesh Kumar");
    expect(found.dlNumber).toBe("DL-1420110012345");
    expect(found.dlValidity).toBe("2032-11-14");
    expect(found.dlPreviewAsset).toBeTruthy();
    expect(notFound.driverName).toBeUndefined();
    expect(notFound.dlNumber).toBeUndefined();
    expect(notFound.dlValidity).toBeUndefined();
    expect(notFound.dlWarning).toContain("Enter them manually");
    expect(notFound.dlError).toBeUndefined();
  });
});
