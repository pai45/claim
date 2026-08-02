import { describe, expect, it } from "vitest";
import {
  appDataPayloadForResolution,
  buildGroundedAppData,
  createAppDataFallbackSummary,
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
    expect(resolution && appDataPayloadForResolution(resolution)).toEqual({
      target: "claim",
      claimId: "CLM-44088",
    });
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
