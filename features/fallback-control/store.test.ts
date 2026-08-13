import { describe, expect, it } from "vitest";
import {
  FALLBACK_CONTROL_STORAGE_KEY,
  readFallbackControlState,
  writeFallbackControlState,
} from "@/features/fallback-control/store";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => map.set(key, value),
    removeItem: (key: string) => map.delete(key),
  };
}

describe("fallback control store", () => {
  it("defaults both fallback controls to enabled", () => {
    expect(readFallbackControlState(memoryStorage())).toEqual({
      meal: true,
      fuel: true,
    });
  });

  it("migrates explicit legacy choices and writes the versioned contract", () => {
    const storage = memoryStorage();
    storage.setItem(
      FALLBACK_CONTROL_STORAGE_KEY,
      JSON.stringify({ meal: false, fuel: true }),
    );
    expect(readFallbackControlState(storage)).toEqual({
      meal: false,
      fuel: true,
    });
    writeFallbackControlState({ meal: true, fuel: false }, storage);
    expect(JSON.parse(storage.getItem(FALLBACK_CONTROL_STORAGE_KEY)!)).toEqual({
      version: 2,
      wallets: { meal: true, fuel: false },
    });
  });
});
