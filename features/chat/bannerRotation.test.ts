import { describe, expect, it } from "vitest";
import {
  BANNER_STAGE_KEY,
  nextBannerStage,
  readBannerStage,
  writeBannerStage,
} from "./bannerRotation";

function fakeStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("nextBannerStage", () => {
  it("cycles 1 → 2 → 3 → 1", () => {
    expect(nextBannerStage(1)).toBe(2);
    expect(nextBannerStage(2)).toBe(3);
    expect(nextBannerStage(3)).toBe(1);
  });
});

describe("banner stage persistence", () => {
  it("starts at stage 1 and walks the full loop across opens", () => {
    const storage = fakeStorage();
    const seen: number[] = [];

    for (let open = 0; open < 4; open += 1) {
      const stage = readBannerStage(storage);
      seen.push(stage);
      writeBannerStage(storage, nextBannerStage(stage));
    }

    expect(seen).toEqual([1, 2, 3, 1]);
  });

  it("round-trips a stage", () => {
    const storage = fakeStorage();
    writeBannerStage(storage, 3);
    expect(readBannerStage(storage)).toBe(3);
  });

  it("treats absent, corrupt, or out-of-range values as the first visit", () => {
    const storage = fakeStorage();
    expect(readBannerStage(storage)).toBe(1);

    storage.setItem(BANNER_STAGE_KEY, "not-a-number");
    expect(readBannerStage(storage)).toBe(1);

    storage.setItem(BANNER_STAGE_KEY, "0");
    expect(readBannerStage(storage)).toBe(1);

    storage.setItem(BANNER_STAGE_KEY, "9");
    expect(readBannerStage(storage)).toBe(1);
  });

  it("survives storage that throws, as in private browsing", () => {
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
    expect(readBannerStage(blocked)).toBe(1);
    expect(() => writeBannerStage(blocked, 2)).not.toThrow();
  });
});
