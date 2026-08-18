import { describe, expect, it } from "vitest";
import { isDriverRegistrationRejected } from "./rejection";

describe("driver registration rejection", () => {
  it("rejects the driver once the vehicle has been resubmitted", () => {
    expect(
      isDriverRegistrationRejected(
        { registeredAt: 300, submissions: 2 },
        { registeredAt: 200 },
      ),
    ).toBe(true);
  });

  it("stays quiet while the vehicle is on its first submission", () => {
    expect(
      isDriverRegistrationRejected(
        { registeredAt: 100, submissions: 1 },
        { registeredAt: 200 },
      ),
    ).toBe(false);
  });

  it("clears once the driver is resubmitted after the vehicle", () => {
    expect(
      isDriverRegistrationRejected(
        { registeredAt: 300, submissions: 2 },
        { registeredAt: 400 },
      ),
    ).toBe(false);
  });

  it("never rejects while either registration is missing", () => {
    expect(
      isDriverRegistrationRejected(null, { registeredAt: 200 }),
    ).toBe(false);
    expect(
      isDriverRegistrationRejected({ registeredAt: 300, submissions: 2 }, null),
    ).toBe(false);
    expect(isDriverRegistrationRejected(null, null)).toBe(false);
  });

  it("does not reject a vehicle and driver written in the same tick", () => {
    expect(
      isDriverRegistrationRejected(
        { registeredAt: 300, submissions: 2 },
        { registeredAt: 300 },
      ),
    ).toBe(false);
  });
});
