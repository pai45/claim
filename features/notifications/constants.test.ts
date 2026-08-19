import { describe, expect, it } from "vitest";
import { getClaimDetails } from "@/features/claims/constants";
import {
  RETURNING_NOTIFICATION_COUNT,
  RETURNING_NOTIFICATIONS,
  getDraftClaimsNotification,
  getNotificationsForPersona,
} from "./constants";

describe("notification catalog", () => {
  it("provides six actionable notifications for Vishal", () => {
    const notifications = getNotificationsForPersona("returning");

    expect(notifications).toHaveLength(6);
    expect(RETURNING_NOTIFICATION_COUNT).toBe(6);
    expect(notifications).toBe(RETURNING_NOTIFICATIONS);
    expect(notifications.map((item) => item.action.kind)).toEqual([
      "route",
      "assistant",
      "assistant",
      "claim",
      "claim",
      "claim",
    ]);
  });

  it("keeps the catalog persona-based instead of deleting hidden items", () => {
    expect(getNotificationsForPersona("new_user")).toEqual([]);
    expect(getNotificationsForPersona("returning")).toHaveLength(6);
    expect(getNotificationsForPersona("rahul_onboarding")).toBe(
      RETURNING_NOTIFICATIONS,
    );
  });

  it("links claim updates to real demo claims", () => {
    const claimIds = RETURNING_NOTIFICATIONS.flatMap((notification) =>
      notification.action.kind === "claim"
        ? [notification.action.claimId]
        : [],
    );

    expect(claimIds).toEqual([
      "CLM-124",
      "CLM-45188",
      "CLM-45140",
    ]);
    expect(claimIds.map((claimId) => getClaimDetails(claimId).id)).toEqual(
      claimIds,
    );
  });

  it("creates a singular or plural alert for saved claim drafts", () => {
    expect(getDraftClaimsNotification(0)).toBeNull();
    expect(getDraftClaimsNotification(1)).toMatchObject({
      title: "1 claim in draft",
      action: { kind: "route", href: "/chat-drafts" },
    });
    expect(getDraftClaimsNotification(3)).toMatchObject({
      title: "3 claims in draft",
    });
  });
});
