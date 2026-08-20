import { describe, expect, it } from "vitest";
import { getClaimDetails } from "@/features/claims/constants";
import {
  RETURNING_NOTIFICATION_COUNT,
  RETURNING_NOTIFICATIONS,
  getDraftClaimsNotification,
  getNotificationsForPersona,
} from "./constants";

const VEHICLE_REJECTED = {
  isVehicleRegistered: true,
  isDriverRegistered: true,
  isVehicleRejected: true,
  isDriverRejected: false,
};

const DRIVER_REJECTED = {
  isVehicleRegistered: true,
  isDriverRegistered: true,
  isVehicleRejected: false,
  isDriverRejected: true,
};

describe("notification catalog", () => {
  it("provides four regular actionable notifications for Vishal", () => {
    const notifications = getNotificationsForPersona("returning");

    expect(notifications).toHaveLength(4);
    expect(RETURNING_NOTIFICATION_COUNT).toBe(4);
    expect(notifications).toBe(RETURNING_NOTIFICATIONS);
    expect(notifications.map((item) => item.action.kind)).toEqual([
      "assistant",
      "claim",
      "claim",
      "claim",
    ]);
  });

  it("adds only the matching registration failure after its home callout is rejected", () => {
    const vehicleFailureNotifications = getNotificationsForPersona(
      "returning",
      VEHICLE_REJECTED,
    );
    const driverFailureNotifications = getNotificationsForPersona(
      "returning",
      DRIVER_REJECTED,
    );

    expect(vehicleFailureNotifications[0]).toMatchObject({
      id: "vehicle-registration-failed",
    });
    expect(vehicleFailureNotifications.map((notification) => notification.id)).not.toContain(
      "driver-registration-failed",
    );
    expect(driverFailureNotifications[0]).toMatchObject({
      id: "driver-registration-failed",
    });
    expect(driverFailureNotifications.map((notification) => notification.id)).not.toContain(
      "vehicle-registration-failed",
    );
    expect(getNotificationsForPersona("new_user", VEHICLE_REJECTED)).toEqual([
      expect.objectContaining({ id: "vehicle-registration-failed" }),
    ]);
  });

  it("keeps the regular catalog persona-based", () => {
    expect(getNotificationsForPersona("new_user")).toEqual([]);
    expect(getNotificationsForPersona("returning")).toHaveLength(4);
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
