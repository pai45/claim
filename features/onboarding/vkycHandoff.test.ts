import { describe, expect, it } from "vitest";
import {
  VKYC_DONE_KEY,
  clearVkycDone,
  markVkycDone,
  readVkycDone,
} from "./vkycHandoff";

function fakeStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

function throwingStorage() {
  return {
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
}

describe("vkyc done flag", () => {
  it("is unset until the demo is finished", () => {
    const storage = fakeStorage();
    expect(readVkycDone(storage)).toBe(false);

    markVkycDone(storage);
    expect(storage.getItem(VKYC_DONE_KEY)).toBe("1");
    expect(readVkycDone(storage)).toBe(true);
  });

  it("clears so a stale flag cannot auto-complete the next run", () => {
    const storage = fakeStorage();
    markVkycDone(storage);
    clearVkycDone(storage);
    expect(readVkycDone(storage)).toBe(false);
  });

  it("treats any other stored value as unfinished", () => {
    const storage = fakeStorage();
    storage.setItem(VKYC_DONE_KEY, "0");
    expect(readVkycDone(storage)).toBe(false);
  });

  it("stays safe when storage throws", () => {
    const storage = throwingStorage();
    expect(() => markVkycDone(storage)).not.toThrow();
    expect(() => clearVkycDone(storage)).not.toThrow();
    expect(readVkycDone(storage)).toBe(false);
  });
});
