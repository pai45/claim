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

function lookupOrThrow(plate: string, owner = "Akshay") {
  const result = buildVehicleLookup(plate, owner);
  if (!result.ok) throw new Error(`expected ${plate} to parse: ${result.message}`);
  return result.lookup;
}

describe("registered vehicle store", () => {
  it("round-trips a fully derived lookup", () => {
    const storage = fakeStorage();
    const lookup = lookupOrThrow("KA 05 RS 1035");

    saveRegisteredVehicle(lookup, storage, 1000);
    const loaded = loadRegisteredVehicle(storage);

    expect(loaded?.registeredAt).toBe(1000);
    expect(loaded?.lookup.profile.id).toBe(lookup.profile.id);
    expect(loaded?.lookup.regNumber.formatted).toBe("KA 05 RS 1035");
    expect(loaded?.lookup.ownerName).toBe("Akshay");
    expect(loaded?.lookup.chassisNumber).toBe(lookup.chassisNumber);
    expect(loaded?.lookup.engineNumber).toBe(lookup.engineNumber);
  });

  it("stores the plate only, never a snapshot of the vehicle", () => {
    // The point of re-deriving: a persisted lookup written before chassis
    // numbers existed would be missing them forever.
    const storage = fakeStorage();
    saveRegisteredVehicle(lookupOrThrow("KA05RS1035"), storage);

    const stored = JSON.parse(storage.getItem(VEHICLE_STORAGE_KEY) ?? "{}");
    expect(stored).toEqual({
      version: 1,
      regNumber: "KA05RS1035",
      ownerName: "Akshay",
      registeredAt: expect.any(Number),
    });
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

  it("discards a plate that no longer parses", () => {
    const storage = fakeStorage();
    storage.setItem(
      VEHICLE_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        regNumber: "ZZ99ZZ9999",
        ownerName: "Akshay",
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
      JSON.stringify({ version: 1, regNumber: "KA05RS1035", registeredAt: 1 }),
    );

    expect(loadRegisteredVehicle(storage)?.lookup.ownerName).toBe("Akshay");
  });

  it("clears the stored vehicle", () => {
    const storage = fakeStorage();
    saveRegisteredVehicle(lookupOrThrow("KA05RS1035"), storage);

    clearRegisteredVehicle(storage);

    expect(storage.getItem(VEHICLE_STORAGE_KEY)).toBeNull();
    expect(loadRegisteredVehicle(storage)).toBeNull();
  });
});
