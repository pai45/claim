import { describe, expect, it } from "vitest";
import {
  appDataPayloadForResolution,
  buildGroundedAppData,
  checkAppDataGrounding,
  createAppDataFallbackSummary,
  createAppDataLeadSummary,
  isGroundedAppDataAnswer,
  resolveAppDataQuestion,
} from "./appData";

describe("app-data question routing", () => {
  it("routes the dashboard quick action", () => {
    expect(
      resolveAppDataQuestion("View dashboard", "view_dashboard"),
    ).toEqual({ kind: "dashboard", categoryId: undefined });
  });

  it("routes filtered claim-history questions", () => {
    expect(resolveAppDataQuestion("Show my pending fuel claims")).toEqual({
      kind: "claims",
      categoryId: "fuel",
      status: "Pending",
    });
  });

  it("routes a category dashboard question", () => {
    expect(
      resolveAppDataQuestion("How much is available on my fuel dashboard?"),
    ).toEqual({ kind: "dashboard", categoryId: "fuel" });
  });

  it("routes a known claim ID to claim details", () => {
    const resolution = resolveAppDataQuestion("What happened to CLM-44088?");
    expect(resolution).toEqual({ kind: "claims", claimId: "CLM-44088" });
    const payload = resolution && appDataPayloadForResolution(resolution);
    expect(payload).toMatchObject({ target: "claim", claimId: "CLM-44088" });
    expect(payload?.structured?.kind).toBe("claims_history");
  });

  it("routes claim questions that name a category", () => {
    expect(resolveAppDataQuestion("What is the status of my fuel claim?")).toEqual(
      {
        kind: "claims",
        categoryId: "fuel",
        status: undefined,
      },
    );
    expect(resolveAppDataQuestion("Show mobile claims")).toEqual({
      kind: "claims",
      categoryId: "mobile",
      status: undefined,
    });
    expect(
      resolveAppDataQuestion("Tell me about my Books & Periodicals claims"),
    ).toEqual({
      kind: "claims",
      categoryId: "books",
      status: undefined,
    });
  });

  it("keeps explicit tracking in the existing deterministic workflow", () => {
    expect(resolveAppDataQuestion("Track claim")).toBeNull();
    expect(resolveAppDataQuestion("What is the status of my claim?")).toBeNull();
  });

  it("uses the active claims context for a follow-up", () => {
    expect(
      resolveAppDataQuestion("Which ones are approved?", undefined, {
        kind: "claims",
        categoryId: "books",
      }),
    ).toEqual({
      kind: "claims",
      categoryId: "books",
      status: "Approved",
    });
  });

  it("routes rejected and needs-info questions to real claims", () => {
    expect(resolveAppDataQuestion("Show my rejected claims")).toEqual({
      kind: "claims",
      categoryId: undefined,
      status: "Rejected",
    });
    expect(resolveAppDataQuestion("Why was my claim rejected?")).toEqual({
      kind: "claims",
      categoryId: undefined,
      status: "Rejected",
    });
  });

  it("routes cross-benefit questions to the wallet overview", () => {
    expect(resolveAppDataQuestion("Which wallet has the most left?")).toEqual({
      kind: "wallets",
    });
  });

  it("routes generic rule questions without stealing personal ones", () => {
    expect(resolveAppDataQuestion("What makes a claim fail?")).toEqual({
      kind: "rules",
      categoryId: undefined,
    });
  });

  it("routes merchant eligibility questions", () => {
    expect(resolveAppDataQuestion("Is Shell allowed for fuel?")).toEqual({
      kind: "merchants",
      benefitType: "fuel",
      query: "Shell",
    });
  });
});

describe("grounded sources beyond the dashboard", () => {
  it("returns the rejected claim that used to be filtered out entirely", () => {
    const source = buildGroundedAppData({
      kind: "claims",
      status: "Rejected",
    }) as { claims: Array<{ id: string }>; summary: { totalCount: number } };

    // Newest first: the internet bill the empty-state banner links to, then
    // the fuel claim.
    expect(source.summary.totalCount).toBe(2);
    expect(source.claims.map((claim) => claim.id)).toEqual([
      "CLM-124",
      "CLM-45033",
    ]);
  });

  it("covers every wallet in the overview, including the ones without a dashboard", () => {
    const source = buildGroundedAppData({ kind: "wallets" }) as {
      wallets: Array<{ categoryId: string }>;
    };

    expect(source.wallets.map((wallet) => wallet.categoryId)).toEqual(
      expect.arrayContaining(["meal", "gift", "professional"]),
    );
  });

  it("summarizes wallets deterministically when the model is unavailable", () => {
    const answer = createAppDataFallbackSummary("Where do I have room left?", {
      kind: "wallets",
    });

    expect(answer).toContain("Meal Wallet");
    expect(answer).toContain("Total available");
  });

  it("links rule answers to the policy screen and merchant answers nowhere", () => {
    expect(appDataPayloadForResolution({ kind: "rules", categoryId: "fuel" })).toMatchObject(
      { target: "policy", categoryId: "fuel" },
    );
    expect(appDataPayloadForResolution({ kind: "merchants" })).toMatchObject({
      target: "none",
    });
  });

  it.each([
    [{ kind: "dashboard" as const }, "claims_dashboard"],
    [{ kind: "dashboard" as const, categoryId: "fuel" as const }, "category_dashboard"],
    [{ kind: "claims" as const, status: "Pending" as const }, "claims_history"],
    [{ kind: "wallets" as const }, "wallet_overview"],
    [{ kind: "rules" as const }, "claim_rules"],
    [{ kind: "merchants" as const, benefitType: "fuel" as const, query: "Shell" }, "merchant_allowlist"],
  ])("builds a structured payload for %s", (resolution, expectedKind) => {
    const source = buildGroundedAppData(resolution);
    const payload = appDataPayloadForResolution(resolution, source);

    expect(payload.structured).toBe(source);
    expect(payload.structured?.kind).toBe(expectedKind);
    expect(createAppDataLeadSummary(source).length).toBeGreaterThan(0);
  });
});

describe("grounded app-data answers", () => {
  it("summarizes the dashboard directly from app constants", () => {
    const resolution = { kind: "dashboard" as const };
    const answer = createAppDataFallbackSummary("Show my dashboard", resolution);

    expect(answer).toContain("2,05,000");
    expect(answer).toContain("80,000");
    expect(answer).toContain("2,85,000");
  });

  it("summarizes a specific claim", () => {
    const resolution = {
      kind: "claims" as const,
      claimId: "CLM-44088",
    };
    const answer = createAppDataFallbackSummary("Status?", resolution);

    expect(answer).toContain("CLM-44088");
    expect(answer).toContain("Pending");
    expect(answer).toContain("₹3,200");
  });

  it("reports which facts failed instead of only that grounding failed", () => {
    const source = buildGroundedAppData({
      kind: "claims",
      claimId: "CLM-44088",
    });
    const check = checkAppDataGrounding(
      "CLM-99999 is pending for ₹9,999.",
      source,
    );

    expect(check.grounded).toBe(false);
    expect(check.reason).toBe("ungrounded");
    expect(check.offendingFacts).toContain("9999");
    expect(check.offendingClaimIds).toEqual(["CLM-99999"]);
  });

  it("rejects numbers and claim IDs absent from the selected source", () => {
    const source = buildGroundedAppData({
      kind: "claims",
      claimId: "CLM-44088",
    });

    expect(
      isGroundedAppDataAnswer(
        "CLM-44088 is pending for ₹3,200 on 04 July 2026.",
        source,
      ),
    ).toBe(true);
    expect(
      isGroundedAppDataAnswer(
        "CLM-99999 is pending for ₹9,999 on 04 July 2026.",
        source,
      ),
    ).toBe(false);
  });
});
