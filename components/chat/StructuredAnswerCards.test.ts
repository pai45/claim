import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getPolicyCategory } from "@/features/policy/constants";
import {
  appDataPayloadForResolution,
  buildGroundedAppData,
} from "@/lib/assistant/appData";
import { policyPayloadForAnswer } from "@/lib/assistant/policy";
import { AppDataAnswerCard } from "./AppDataAnswerCard";
import { PolicyAnswerCard } from "./PolicyAnswerCard";

describe("structured assistant answer cards", () => {
  it("renders dashboard facts as a table with an accessible progress bar", () => {
    const resolution = { kind: "dashboard" as const };
    const source = buildGroundedAppData(resolution);
    const html = renderToStaticMarkup(
      createElement(AppDataAnswerCard, {
        content: "Here is your current claims balance.",
        payload: appDataPayloadForResolution(resolution, source),
      }),
    );

    expect(html).toContain("Claims dashboard (FY 26/27)");
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="28"');
    expect(html).toContain('aria-label="Claims dashboard totals"');
    expect(html).toContain('href="/dashboard"');
    expect(html).not.toContain("btn-secondary");
  });

  it("renders claim summaries and only the latest three claim rows", () => {
    const resolution = { kind: "claims" as const };
    const source = buildGroundedAppData(resolution);
    const html = renderToStaticMarkup(
      createElement(AppDataAnswerCard, {
        content: "Here are your matching claims.",
        payload: appDataPayloadForResolution(resolution, source),
      }),
    );

    expect(html).toContain('aria-label="Claim status summary"');
    expect(html).toContain('aria-label="Latest claims"');
    expect((html.match(/CLM-/g) ?? []).length).toBe(3);
    expect(html).toContain('href="/claims-history"');
  });

  it("renders a structured empty state for filters with no claims", () => {
    const resolution = { kind: "claims" as const, categoryId: "meal" as const };
    const source = buildGroundedAppData(resolution);
    const html = renderToStaticMarkup(
      createElement(AppDataAnswerCard, {
        content: "There are no claims matching your current filters.",
        payload: appDataPayloadForResolution(resolution, source),
      }),
    );

    expect(html).toContain("Meal Wallet claims");
    expect(html).toContain("No claims found");
    expect(html).toContain("Try a different category or status.");
  });

  it("renders policy comparisons as separate tables with one action per benefit", () => {
    const categories = [getPolicyCategory("meal"), getPolicyCategory("fuel")];
    const payload = policyPayloadForAnswer(
      "Compare meal and fuel benefits",
      categories,
    );
    const html = renderToStaticMarkup(
      createElement(PolicyAnswerCard, {
        content: "Here is a side-by-side policy comparison.",
        payload,
      }),
    );

    expect(html).toContain("Comparing Meal Wallet and Fuel &amp; Maintenance");
    expect(html).toContain('aria-label="Meal Wallet details"');
    expect(html).toContain('aria-label="Fuel &amp; Maintenance details"');
    expect(html).toContain('href="/policy-details/meal"');
    expect(html).toContain('href="/policy-details/fuel"');
  });
});
