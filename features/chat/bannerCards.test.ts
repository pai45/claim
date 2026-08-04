import { describe, expect, it } from "vitest";
import { getClaimDetails } from "@/features/claims/constants";
import {
  REJECTED_BILL_CLAIM_ID,
  bannerCardsForStage,
  type BannerCardContent,
} from "./bannerCards";

function ids(cards: BannerCardContent[]): string[] {
  return cards.map((card) => card.id);
}

describe("bannerCardsForStage", () => {
  it("shows only the evergreen promo on a first visit", () => {
    expect(ids(bannerCardsForStage(1))).toEqual(["vehicle_registration"]);
  });

  it("adds the bill reminder ahead of the promo on a second visit", () => {
    expect(ids(bannerCardsForStage(2))).toEqual([
      "internet_bill_due",
      "vehicle_registration",
    ]);
  });

  it("leads with the rejection on a third visit", () => {
    expect(ids(bannerCardsForStage(3))).toEqual([
      "internet_bill_rejected",
      "internet_bill_due",
      "vehicle_registration",
    ]);
  });

  it("keeps the promo last so a notification is always what the user lands on", () => {
    for (const stage of [1, 2, 3] as const) {
      const cards = bannerCardsForStage(stage);
      expect(cards[cards.length - 1]?.id).toBe("vehicle_registration");
    }
  });
});

describe("banner copy stays grounded in app data", () => {
  it("quotes the real submission deadline and bill amount", () => {
    const due = bannerCardsForStage(2)[0];
    expect(due.body).toContain("before the 5th");
    expect(due.body).toContain("₹899");
    // Two lines in a ~318px card is roughly this much text.
    expect(due.body.length).toBeLessThanOrEqual(90);
  });

  it("links to a claim that really is rejected", () => {
    // getClaimDetails silently falls back to an unrelated sample claim for
    // unknown ids, so an untracked id would open the wrong screen.
    const details = getClaimDetails(REJECTED_BILL_CLAIM_ID);
    expect(details.id).toBe(REJECTED_BILL_CLAIM_ID);
    expect(details.status).toBe("Rejected");
    expect(details.category).toBe("Telephone & Internet");
  });

  it("points the rejection card at that claim", () => {
    const rejected = bannerCardsForStage(3)[0];
    expect(rejected.action).toEqual({
      kind: "claim",
      claimId: REJECTED_BILL_CLAIM_ID,
    });
    expect(rejected.title).toContain(REJECTED_BILL_CLAIM_ID);
    expect(rejected.tone).toBe("alert");
  });
});
