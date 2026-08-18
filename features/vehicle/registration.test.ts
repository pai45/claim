import { describe, expect, it } from "vitest";
import {
  VEHICLE_STORAGE_KEY,
  clearRegisteredVehicle,
  loadRegisteredVehicle,
  saveRegisteredVehicle,
} from "./registration";
import { buildVehicleLookup } from "@/lib/vehicle/demoLookup";

function fakeStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

function lookupOrThrow(plate: string, owner = "Vishal Sharma") {
  const result = buildVehicleLookup(plate, owner);
  if (!result.ok) throw new Error(`expected ${plate} to parse: ${result.message}`);
  return result.lookup;
}

describe("registered vehicle store", () => {
  it("round-trips a fully derived lookup", () => {
    const storage = fakeStorage();
    const lookup = lookupOrThrow("KA 05 RS 1035");

    saveRegisteredVehicle(lookup, "self_owned", storage, 1000);
    const loaded = loadRegisteredVehicle(storage);

    expect(loaded?.registeredAt).toBe(1000);
    expect(loaded?.lookup.profile.id).toBe(lookup.profile.id);
    expect(loaded?.lookup.regNumber.formatted).toBe("KA 05 RS 1035");
    expect(loaded?.lookup.ownerName).toBe("Vishal Sharma");
    expect(loaded?.lookup.chassisNumber).toBe(lookup.chassisNumber);
    expect(loaded?.lookup.engineNumber).toBe(lookup.engineNumber);
    expect(loaded?.ownership).toBe("self_owned");
  });

  it("stores minimal registration data, never a vehicle snapshot", () => {
    // The point of re-deriving: a persisted lookup written before chassis
    // numbers existed would be missing them forever.
    const storage = fakeStorage();
    saveRegisteredVehicle(lookupOrThrow("KA05RS1035"), "company_leased", storage);

    const stored = JSON.parse(storage.getItem(VEHICLE_STORAGE_KEY) ?? "{}");
    expect(stored).toEqual({
      version: 2,
      regNumber: "KA05RS1035",
      ownerName: "Vishal Sharma",
      ownership: "company_leased",
      registeredAt: expect.any(Number),
      submissions: 1,
    });
  });

  it("counts a resubmission of the same registration", () => {
    const storage = fakeStorage();
    const lookup = lookupOrThrow("KA05RS1035");

    saveRegisteredVehicle(lookup, "self_owned", storage, 1000);
    expect(loadRegisteredVehicle(storage)?.submissions).toBe(1);

    saveRegisteredVehicle(lookup, "self_owned", storage, 2000);
    expect(loadRegisteredVehicle(storage)?.submissions).toBe(2);
  });

  it("restarts the count after the vehicle is cleared", () => {
    const storage = fakeStorage();
    const lookup = lookupOrThrow("KA05RS1035");

    saveRegisteredVehicle(lookup, "self_owned", storage, 1000);
    clearRegisteredVehicle(storage);
    saveRegisteredVehicle(lookup, "self_owned", storage, 2000);

    expect(loadRegisteredVehicle(storage)?.submissions).toBe(1);
  });

  it("reads a record written before submissions existed as one submission", () => {
    const storage = fakeStorage();
    storage.setItem(
      VEHICLE_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        regNumber: "KA05RS1035",
        ownerName: "Vishal Sharma",
        ownership: "self_owned",
        registeredAt: 1,
      }),
    );

    expect(loadRegisteredVehicle(storage)?.submissions).toBe(1);
  });

  it("returns null without a stored vehicle", () => {
    expect(loadRegisteredVehicle(fakeStorage())).toBeNull();
  });

  it("discards a record written by an older version", () => {
    const storage = fakeStorage();
    storage.setItem(
      VEHICLE_STORAGE_KEY,
      JSON.stringify({ version: 0, regNumber: "KA05RS1035", registeredAt: 1 }),
    );

    expect(loadRegisteredVehicle(storage)).toBeNull();
    expect(storage.getItem(VEHICLE_STORAGE_KEY)).toBeNull();
  });

  it("discards corrupt JSON instead of throwing", () => {
    const storage = fakeStorage();
    storage.setItem(VEHICLE_STORAGE_KEY, "{not json");

    expect(loadRegisteredVehicle(storage)).toBeNull();
    expect(storage.getItem(VEHICLE_STORAGE_KEY)).toBeNull();
  });

  it("discards a record without a supported ownership choice", () => {
    const storage = fakeStorage();
    storage.setItem(
      VEHICLE_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        regNumber: "KA05RS1035",
        ownerName: "Vishal Sharma",
        ownership: "rented",
        registeredAt: 1,
      }),
    );

    expect(loadRegisteredVehicle(storage)).toBeNull();
    expect(storage.getItem(VEHICLE_STORAGE_KEY)).toBeNull();
  });

  it("discards a plate that no longer parses", () => {
    const storage = fakeStorage();
    storage.setItem(
      VEHICLE_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        regNumber: "ZZ99ZZ9999",
        ownerName: "Vishal Sharma",
        ownership: "self_owned",
        registeredAt: 1,
      }),
    );

    expect(loadRegisteredVehicle(storage)).toBeNull();
    expect(storage.getItem(VEHICLE_STORAGE_KEY)).toBeNull();
  });

  it("falls back to the default owner when the stored name is missing", () => {
    const storage = fakeStorage();
    storage.setItem(
      VEHICLE_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        regNumber: "KA05RS1035",
        ownership: "self_owned",
        registeredAt: 1,
      }),
    );

    expect(loadRegisteredVehicle(storage)?.lookup.ownerName).toBe("Vishal Sharma");
  });

  it("clears the stored vehicle", () => {
    const storage = fakeStorage();
    saveRegisteredVehicle(lookupOrThrow("KA05RS1035"), "self_owned", storage);

    clearRegisteredVehicle(storage);

    expect(storage.getItem(VEHICLE_STORAGE_KEY)).toBeNull();
    expect(loadRegisteredVehicle(storage)).toBeNull();
  });
});
