import { describe, expect, it } from "vitest";
import {
  IN_APP_CLAIMS_ENTRY_KEY,
  isDirectClaimsEntry,
  markInAppClaimsEntry,
  resolveClaimsEntry,
  takeInAppClaimsEntry,
} from "./directClaimsEntry";

function fakeStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("direct Benefits Assistant entry", () => {
  it("recognizes the direct /#claims deep link", () => {
    expect(isDirectClaimsEntry("#claims", "")).toBe(true);
    expect(isDirectClaimsEntry("#CLAIMS", "")).toBe(true);
  });

  it("does not enable the bypass for other hashes or query variants", () => {
    expect(isDirectClaimsEntry("", "")).toBe(false);
    expect(isDirectClaimsEntry("#scan-pay", "")).toBe(false);
    expect(isDirectClaimsEntry("#claims", "?mode=benefits")).toBe(false);
  });

  it("hands off an in-app claims navigation exactly once", () => {
    const storage = fakeStorage();

    markInAppClaimsEntry(storage);

    expect(storage.getItem(IN_APP_CLAIMS_ENTRY_KEY)).toBe("true");
    expect(takeInAppClaimsEntry(storage)).toBe(true);
    expect(takeInAppClaimsEntry(storage)).toBe(false);
  });

  it("does not report an in-app entry when no marker exists", () => {
    expect(takeInAppClaimsEntry(fakeStorage())).toBe(false);
  });

  it("preserves the active persona for an in-app return to claims", () => {
    expect(resolveClaimsEntry("#claims", "", true)).toEqual({
      isClaimsEntry: true,
      shouldSelectDefaultPersona: false,
    });
  });

  it("selects the default demo persona for a genuine direct claims link", () => {
    expect(resolveClaimsEntry("#claims", "", false)).toEqual({
      isClaimsEntry: true,
      shouldSelectDefaultPersona: true,
    });
  });
});
