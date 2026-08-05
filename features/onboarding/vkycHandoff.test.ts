import { describe, expect, it } from "vitest";
import {
  VKYC_DONE_KEY,
  VKYC_ROUTE_KEY,
  chromeSchemeUrl,
  clearVkycDone,
  clearVkycHandoff,
  handoffFlagCanCross,
  markVkycDone,
  readHandoffRoute,
  readVkycDone,
  safariSchemeUrl,
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

describe("browser-app URL schemes", () => {
  it("rewrites https and http for Chrome on iOS", () => {
    expect(chromeSchemeUrl("https://pai45.github.io/claim/vkyc/")).toBe(
      "googlechromes://pai45.github.io/claim/vkyc/",
    );
    expect(chromeSchemeUrl("http://192.168.1.3:3000/vkyc/")).toBe(
      "googlechrome://192.168.1.3:3000/vkyc/",
    );
  });

  it("does not rewrite the host, only the scheme", () => {
    // A naive replace would also hit "https" appearing later in the URL.
    expect(chromeSchemeUrl("https://x.test/go?to=https://y.test")).toBe(
      "googlechromes://x.test/go?to=https://y.test",
    );
  });

  it("prefixes for Safari", () => {
    expect(safariSchemeUrl("https://pai45.github.io/claim/vkyc/")).toBe(
      "x-safari-https://pai45.github.io/claim/vkyc/",
    );
  });
});

describe("handoffFlagCanCross", () => {
  it("is true for a tab of this same browser", () => {
    const storage = fakeStorage();
    storage.setItem(VKYC_ROUTE_KEY, "new-tab");
    expect(readHandoffRoute(storage)).toBe("new-tab");
    expect(handoffFlagCanCross(storage)).toBe(true);

    storage.setItem(VKYC_ROUTE_KEY, "same-tab");
    expect(handoffFlagCanCross(storage)).toBe(true);
  });

  it("is false once the demo left for another app", () => {
    const storage = fakeStorage();
    storage.setItem(VKYC_ROUTE_KEY, "external-app");
    expect(handoffFlagCanCross(storage)).toBe(false);
  });

  it("ignores a route it does not recognise", () => {
    const storage = fakeStorage();
    storage.setItem(VKYC_ROUTE_KEY, "carrier-pigeon");
    expect(readHandoffRoute(storage)).toBeNull();
  });

  it("clears both keys together", () => {
    const storage = fakeStorage();
    markVkycDone(storage);
    storage.setItem(VKYC_ROUTE_KEY, "external-app");

    clearVkycHandoff(storage);
    expect(readVkycDone(storage)).toBe(false);
    expect(readHandoffRoute(storage)).toBeNull();
  });
});
