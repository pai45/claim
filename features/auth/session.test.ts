import { describe, expect, it } from "vitest";
import {
  AUTH_STORAGE_KEY,
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from "./session";

function fakeStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    values,
  };
}

describe("auth session store", () => {
  it("round-trips a signed-in number", () => {
    const storage = fakeStorage();

    saveAuthSession("9876543210", storage, 1000);
    const loaded = loadAuthSession(storage);

    expect(loaded).toEqual({
      mobile: "9876543210",
      countryCode: "+91",
      signedInAt: 1000,
    });
  });

  it("persists the exact record shape", () => {
    // Pinned so the stored shape cannot drift away from the read-side checks.
    const storage = fakeStorage();
    saveAuthSession("9876543210", storage, 1000);

    expect(JSON.parse(storage.values.get(AUTH_STORAGE_KEY) ?? "{}")).toEqual({
      version: 1,
      mobile: "9876543210",
      countryCode: "+91",
      signedInAt: 1000,
    });
  });

  it("returns null when nothing is stored", () => {
    expect(loadAuthSession(fakeStorage())).toBeNull();
  });

  it("discards a record written by an older version", () => {
    const storage = fakeStorage();
    storage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        version: 0,
        mobile: "9876543210",
        countryCode: "+91",
        signedInAt: 1000,
      }),
    );

    expect(loadAuthSession(storage)).toBeNull();
    expect(storage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it("discards corrupt JSON", () => {
    const storage = fakeStorage();
    storage.setItem(AUTH_STORAGE_KEY, "{not json");

    expect(loadAuthSession(storage)).toBeNull();
    expect(storage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it.each(["12345", "0123456789", "5876543210", ""])(
    "discards a hand-edited number that no longer validates: %s",
    (mobile) => {
      const storage = fakeStorage();
      storage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          version: 1,
          mobile,
          countryCode: "+91",
          signedInAt: 1000,
        }),
      );

      expect(loadAuthSession(storage)).toBeNull();
      expect(storage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    },
  );

  it("discards a record missing signedInAt", () => {
    const storage = fakeStorage();
    storage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        mobile: "9876543210",
        countryCode: "+91",
      }),
    );

    expect(loadAuthSession(storage)).toBeNull();
  });

  it("discards a record with an unexpected country code", () => {
    const storage = fakeStorage();
    storage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        mobile: "9876543210",
        countryCode: "+1",
        signedInAt: 1000,
      }),
    );

    expect(loadAuthSession(storage)).toBeNull();
  });

  it("clears the session", () => {
    const storage = fakeStorage();
    saveAuthSession("9876543210", storage);

    clearAuthSession(storage);

    expect(loadAuthSession(storage)).toBeNull();
  });

  it("does not throw when storage rejects writes", () => {
    const blocked = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
      removeItem: () => {
        throw new Error("QuotaExceededError");
      },
    };

    expect(() => saveAuthSession("9876543210", blocked)).not.toThrow();
    expect(() => clearAuthSession(blocked)).not.toThrow();
  });
});
