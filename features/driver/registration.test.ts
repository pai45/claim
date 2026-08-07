import { describe, expect, it } from "vitest";
import {
  DRIVER_STORAGE_KEY,
  clearRegisteredDriver,
  loadRegisteredDriver,
  saveRegisteredDriver,
} from "./registration";

function fakeStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("registered driver store", () => {
  it("round-trips a registered driver payload", () => {
    const storage = fakeStorage();
    const payload = {
      driverName: "Ramesh Kumar",
      dlNumber: "DL-1420110012345",
      salary: "₹15,000 / month",
      startDate: "1 Aug 2026",
    };

    saveRegisteredDriver(payload, storage, 1000);
    const loaded = loadRegisteredDriver(storage);

    expect(loaded).toEqual({
      driverName: "Ramesh Kumar",
      dlNumber: "DL-1420110012345",
      salary: "₹15,000 / month",
      startDate: "1 Aug 2026",
      registeredAt: 1000,
    });
  });

  it("stores the driver record in JSON format", () => {
    const storage = fakeStorage();
    saveRegisteredDriver({ driverName: "Suresh" }, storage, 2000);

    const stored = JSON.parse(storage.getItem(DRIVER_STORAGE_KEY) ?? "{}");
    expect(stored).toEqual({
      version: 1,
      driverName: "Suresh",
      registeredAt: 2000,
    });
  });

  it("returns null when no driver is registered", () => {
    expect(loadRegisteredDriver(fakeStorage())).toBeNull();
  });

  it("discards a record with wrong version", () => {
    const storage = fakeStorage();
    storage.setItem(
      DRIVER_STORAGE_KEY,
      JSON.stringify({ version: 0, driverName: "Ramesh", registeredAt: 1 }),
    );

    expect(loadRegisteredDriver(storage)).toBeNull();
    expect(storage.getItem(DRIVER_STORAGE_KEY)).toBeNull();
  });

  it("discards corrupt JSON instead of throwing", () => {
    const storage = fakeStorage();
    storage.setItem(DRIVER_STORAGE_KEY, "{not json");

    expect(loadRegisteredDriver(storage)).toBeNull();
    expect(storage.getItem(DRIVER_STORAGE_KEY)).toBeNull();
  });

  it("discards record with missing driver name", () => {
    const storage = fakeStorage();
    storage.setItem(
      DRIVER_STORAGE_KEY,
      JSON.stringify({ version: 1, driverName: "  ", registeredAt: 1 }),
    );

    expect(loadRegisteredDriver(storage)).toBeNull();
    expect(storage.getItem(DRIVER_STORAGE_KEY)).toBeNull();
  });

  it("clears the registered driver", () => {
    const storage = fakeStorage();
    saveRegisteredDriver({ driverName: "Ramesh" }, storage);

    clearRegisteredDriver(storage);

    expect(storage.getItem(DRIVER_STORAGE_KEY)).toBeNull();
    expect(loadRegisteredDriver(storage)).toBeNull();
  });
});
