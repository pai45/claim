import { describe, expect, it } from "vitest";
import { getHomeActionCardState } from "./homeActionCards";

describe("Benefits Assistant home action cards", () => {
  it("walks Vishal through vehicle, driver, then notifications only", () => {
    expect(
      getHomeActionCardState("returning", 5, {
        isVehicleRegistered: false,
        isDriverRegistered: false,
      }),
    ).toEqual({ showNotifications: true, registration: "vehicle" });

    expect(
      getHomeActionCardState("returning", 5, {
        isVehicleRegistered: true,
        isDriverRegistered: false,
      }),
    ).toEqual({ showNotifications: true, registration: "driver" });

    expect(
      getHomeActionCardState("returning", 5, {
        isVehicleRegistered: true,
        isDriverRegistered: true,
      }),
    ).toEqual({ showNotifications: true, registration: null });
  });

  it("shows only registration actions for Aarav", () => {
    expect(
      getHomeActionCardState("new_user", 0, {
        isVehicleRegistered: false,
        isDriverRegistered: false,
      }),
    ).toEqual({ showNotifications: false, registration: "vehicle" });

    expect(
      getHomeActionCardState("new_user", 0, {
        isVehicleRegistered: true,
        isDriverRegistered: false,
      }),
    ).toEqual({ showNotifications: false, registration: "driver" });

    expect(
      getHomeActionCardState("new_user", 0, {
        isVehicleRegistered: true,
        isDriverRegistered: true,
      }),
    ).toEqual({ showNotifications: false, registration: null });
  });

  it("removes Vishal's notification card after hide all", () => {
    expect(
      getHomeActionCardState("returning", 0, {
        isVehicleRegistered: false,
        isDriverRegistered: false,
      }),
    ).toEqual({ showNotifications: false, registration: "vehicle" });

    expect(
      getHomeActionCardState("returning", 0, {
        isVehicleRegistered: true,
        isDriverRegistered: true,
      }),
    ).toEqual({ showNotifications: false, registration: null });
  });

  it("shows returning notifications for Rahul", () => {
    expect(
      getHomeActionCardState("rahul_onboarding", 5, {
        isVehicleRegistered: true,
        isDriverRegistered: true,
      }),
    ).toEqual({ showNotifications: true, registration: null });
  });
});
