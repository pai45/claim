import { describe, expect, it } from "vitest";
import { getClaimDetails } from "@/features/claims/constants";
import {
  RETURNING_NOTIFICATION_COUNT,
  RETURNING_NOTIFICATIONS,
  getNotificationsForPersona,
} from "./constants";

describe("notification catalog", () => {
  it("provides five actionable notifications for Vishal", () => {
    const notifications = getNotificationsForPersona("returning");

    expect(notifications).toHaveLength(5);
    expect(RETURNING_NOTIFICATION_COUNT).toBe(5);
    expect(notifications).toBe(RETURNING_NOTIFICATIONS);
    expect(notifications.map((item) => item.action.kind)).toEqual([
      "assistant",
      "claim",
      "claim",
      "claim",
      "claim",
    ]);
  });

  it("keeps the catalog persona-based instead of deleting hidden items", () => {
    expect(getNotificationsForPersona("new_user")).toEqual([]);
    expect(getNotificationsForPersona("returning")).toHaveLength(5);
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
      "CLM-45201",
    ]);
    expect(claimIds.map((claimId) => getClaimDetails(claimId).id)).toEqual(
      claimIds,
    );
  });
});
