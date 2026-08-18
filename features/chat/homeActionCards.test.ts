import { describe, expect, it } from "vitest";
import { getHomeActionCardState } from "./homeActionCards";

const NOTHING_REGISTERED = {
  isVehicleRegistered: false,
  isDriverRegistered: false,
  isVehicleRejected: false,
  isDriverRejected: false,
};
const VEHICLE_ONLY = {
  isVehicleRegistered: true,
  isDriverRegistered: false,
  isVehicleRejected: false,
  isDriverRejected: false,
};
const BOTH_REGISTERED = {
  isVehicleRegistered: true,
  isDriverRegistered: true,
  isVehicleRejected: false,
  isDriverRejected: false,
};
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

describe("Benefits Assistant home action cards", () => {
  it("walks Vishal through vehicle, driver, both rejections, then notifications only", () => {
    expect(getHomeActionCardState("returning", 5, NOTHING_REGISTERED)).toEqual({
      showNotifications: true,
      registration: { kind: "vehicle", status: "pending" },
    });

    expect(getHomeActionCardState("returning", 5, VEHICLE_ONLY)).toEqual({
      showNotifications: true,
      registration: { kind: "driver", status: "pending" },
    });

    expect(getHomeActionCardState("returning", 5, VEHICLE_REJECTED)).toEqual({
      showNotifications: true,
      registration: { kind: "vehicle", status: "rejected" },
    });

    expect(getHomeActionCardState("returning", 5, DRIVER_REJECTED)).toEqual({
      showNotifications: true,
      registration: { kind: "driver", status: "rejected" },
    });

    expect(getHomeActionCardState("returning", 5, BOTH_REGISTERED)).toEqual({
      showNotifications: true,
      registration: null,
    });
  });

  it("shows only registration actions for Aarav", () => {
    expect(getHomeActionCardState("new_user", 0, NOTHING_REGISTERED)).toEqual({
      showNotifications: false,
      registration: { kind: "vehicle", status: "pending" },
    });

    expect(getHomeActionCardState("new_user", 0, VEHICLE_ONLY)).toEqual({
      showNotifications: false,
      registration: { kind: "driver", status: "pending" },
    });

    expect(getHomeActionCardState("new_user", 0, VEHICLE_REJECTED)).toEqual({
      showNotifications: false,
      registration: { kind: "vehicle", status: "rejected" },
    });

    expect(getHomeActionCardState("new_user", 0, DRIVER_REJECTED)).toEqual({
      showNotifications: false,
      registration: { kind: "driver", status: "rejected" },
    });

    expect(getHomeActionCardState("new_user", 0, BOTH_REGISTERED)).toEqual({
      showNotifications: false,
      registration: null,
    });
  });

  it("removes Vishal's notification card after hide all", () => {
    expect(getHomeActionCardState("returning", 0, NOTHING_REGISTERED)).toEqual({
      showNotifications: false,
      registration: { kind: "vehicle", status: "pending" },
    });

    expect(getHomeActionCardState("returning", 0, BOTH_REGISTERED)).toEqual({
      showNotifications: false,
      registration: null,
    });
  });

  it("shows returning notifications for Rahul", () => {
    expect(getHomeActionCardState("rahul_onboarding", 5, BOTH_REGISTERED)).toEqual({
      showNotifications: true,
      registration: null,
    });
  });
});
