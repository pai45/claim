import { describe, expect, it } from "vitest";
import {
  PRODUCT_INTRO_STORAGE_KEY,
  PRODUCT_INTRO_STORAGE_VERSION,
  completeProductIntro,
  isProductIntroComplete,
} from "./storage";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
}

describe("product intro storage", () => {
  it("is incomplete until the intro has been finished or skipped", () => {
    const storage = memoryStorage();

    expect(isProductIntroComplete(storage)).toBe(false);
    completeProductIntro(storage);
    expect(isProductIntroComplete(storage)).toBe(true);
  });

  it("clears stale and malformed records", () => {
    const storage = memoryStorage();
    storage.setItem(
      PRODUCT_INTRO_STORAGE_KEY,
      JSON.stringify({
        version: PRODUCT_INTRO_STORAGE_VERSION + 1,
        completed: true,
      }),
    );

    expect(isProductIntroComplete(storage)).toBe(false);
    expect(storage.getItem(PRODUCT_INTRO_STORAGE_KEY)).toBeNull();

    storage.setItem(PRODUCT_INTRO_STORAGE_KEY, "not-json");
    expect(isProductIntroComplete(storage)).toBe(false);
    expect(storage.getItem(PRODUCT_INTRO_STORAGE_KEY)).toBeNull();
  });

  it("stays safe when browser storage is unavailable", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };

    expect(() => completeProductIntro(blocked)).not.toThrow();
    expect(isProductIntroComplete(blocked)).toBe(false);
  });
});
