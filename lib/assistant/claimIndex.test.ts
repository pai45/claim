import { describe, expect, it } from "vitest";
import { ALL_BENEFIT_CLAIMS } from "@/features/dashboard/benefitClaims";
import { CLAIM_HISTORY_ITEMS } from "@/features/claims-history/constants";
import {
  ASSISTANT_CLAIMS,
  findAssistantClaim,
  matchesClaimStatus,
  summarizeAssistantClaims,
} from "./claimIndex";

describe("unified claim index", () => {
  it("merges both claim datasets without dropping rows", () => {
    const ids = new Set([
      ...ALL_BENEFIT_CLAIMS.map((claim) => claim.id),
      ...CLAIM_HISTORY_ITEMS.map((claim) => claim.id),
    ]);

    expect(ASSISTANT_CLAIMS).toHaveLength(ids.size);
    for (const id of ids) {
      expect(findAssistantClaim(id)).toBeDefined();
    }
  });

  it("exposes the rejected and needs-info claims the assistant used to miss", () => {
    expect(findAssistantClaim("CLM-45033")?.status).toBe("Rejected");
    expect(findAssistantClaim("CLM-45188")?.status).toBe("Needs info");
  });

  it("relabels history rows onto catalog category names", () => {
    // The history screen calls this "Telephone & Internet".
    const claim = findAssistantClaim("CLM-45201");
    expect(claim?.categoryId).toBe("mobile");
    expect(claim?.category).toBe("Mobile & Internet");
  });

  it("treats under review as pending but keeps rejected separate", () => {
    const underReview = findAssistantClaim("CLM-45201");
    expect(underReview?.status).toBe("Under review");
    expect(underReview && matchesClaimStatus(underReview, "Pending")).toBe(true);

    const rejected = findAssistantClaim("CLM-45033");
    expect(rejected && matchesClaimStatus(rejected, "Pending")).toBe(false);
    expect(rejected && matchesClaimStatus(rejected, "Rejected")).toBe(true);
  });

  it("counts every status in the summary", () => {
    const summary = summarizeAssistantClaims(ASSISTANT_CLAIMS);

    expect(summary.totalCount).toBe(ASSISTANT_CLAIMS.length);
    // CLM-45033 (fuel) and CLM-124, the internet claim the empty-state banner
    // links to.
    expect(summary.rejectedCount).toBe(2);
    expect(summary.needsInfoCount).toBe(1);
    expect(
      summary.approvedCount +
        summary.pendingCount +
        summary.needsInfoCount +
        summary.rejectedCount,
    ).toBe(summary.totalCount);
  });

  it("orders claims newest first", () => {
    const timestamps = ASSISTANT_CLAIMS.map((claim) => Date.parse(claim.date));
    const sorted = [...timestamps].sort((left, right) => right - left);
    expect(timestamps).toEqual(sorted);
  });
});
