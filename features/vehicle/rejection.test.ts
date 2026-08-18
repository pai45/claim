import { describe, expect, it } from "vitest";
import { isVehicleRegistrationRejected, rejectedOwnerName } from "./rejection";

describe("vehicle registration rejection", () => {
  it("rejects a vehicle registered before the driver", () => {
    expect(
      isVehicleRegistrationRejected(
        { registeredAt: 100, submissions: 1 },
        { registeredAt: 200 },
      ),
    ).toBe(true);
  });

  it("clears once the vehicle is resubmitted after the driver", () => {
    expect(
      isVehicleRegistrationRejected(
        { registeredAt: 300, submissions: 2 },
        { registeredAt: 200 },
      ),
    ).toBe(false);
  });

  it("does not bounce the vehicle again once the driver is resubmitted", () => {
    expect(
      isVehicleRegistrationRejected(
        { registeredAt: 300, submissions: 2 },
        { registeredAt: 400 },
      ),
    ).toBe(false);
  });

  it("never rejects while either registration is missing", () => {
    expect(isVehicleRegistrationRejected(null, { registeredAt: 200 })).toBe(false);
    expect(
      isVehicleRegistrationRejected({ registeredAt: 100, submissions: 1 }, null),
    ).toBe(false);
    expect(isVehicleRegistrationRejected(null, null)).toBe(false);
  });

  it("does not reject a vehicle and driver registered in the same tick", () => {
    expect(
      isVehicleRegistrationRejected(
        { registeredAt: 200, submissions: 1 },
        { registeredAt: 200 },
      ),
    ).toBe(false);
  });
});

describe("rejectedOwnerName", () => {
  it("turns a profile name into an RC-style mismatch", () => {
    expect(rejectedOwnerName("Vishal Sharma")).toBe("V. S. Kumar");
    expect(rejectedOwnerName("Neha Kapoor")).toBe("N. K. Kumar");
  });

  it("handles single names and stray whitespace", () => {
    expect(rejectedOwnerName("Aarav")).toBe("A. Kumar");
    expect(rejectedOwnerName("  rohan   mehta ")).toBe("R. M. Kumar");
  });

  it("falls back to the surname alone for an empty name", () => {
    expect(rejectedOwnerName("   ")).toBe("Kumar");
  });
});
