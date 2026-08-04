import { describe, expect, it } from "vitest";
import {
  WIDGET_POSITION_KEY,
  loadWidgetPosition,
  saveWidgetPosition,
} from "./widgetPosition";

function fakeStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("new chat widget position", () => {
  it("round-trips a saved position", () => {
    const storage = fakeStorage();
    saveWidgetPosition({ side: "left", yRatio: 0.25 }, storage);
    expect(loadWidgetPosition(storage)).toEqual({ side: "left", yRatio: 0.25 });
  });

  it("returns null when nothing is stored", () => {
    expect(loadWidgetPosition(fakeStorage())).toBeNull();
  });

  it("rejects corrupt, malformed, and out-of-shape values", () => {
    const storage = fakeStorage();

    storage.setItem(WIDGET_POSITION_KEY, "not json");
    expect(loadWidgetPosition(storage)).toBeNull();

    storage.setItem(WIDGET_POSITION_KEY, JSON.stringify({ side: "top", yRatio: 0.5 }));
    expect(loadWidgetPosition(storage)).toBeNull();

    storage.setItem(WIDGET_POSITION_KEY, JSON.stringify({ side: "right" }));
    expect(loadWidgetPosition(storage)).toBeNull();

    storage.setItem(
      WIDGET_POSITION_KEY,
      JSON.stringify({ side: "right", yRatio: Number.NaN }),
    );
    expect(loadWidgetPosition(storage)).toBeNull();
  });

  it("clamps a ratio saved from a differently sized viewport", () => {
    const storage = fakeStorage();

    storage.setItem(WIDGET_POSITION_KEY, JSON.stringify({ side: "right", yRatio: 1.8 }));
    expect(loadWidgetPosition(storage)).toEqual({ side: "right", yRatio: 1 });

    storage.setItem(WIDGET_POSITION_KEY, JSON.stringify({ side: "left", yRatio: -0.4 }));
    expect(loadWidgetPosition(storage)).toEqual({ side: "left", yRatio: 0 });
  });

  it("stays silent when storage throws", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {},
    };
    expect(() => saveWidgetPosition({ side: "right", yRatio: 0.5 }, blocked)).not.toThrow();
    expect(loadWidgetPosition(blocked)).toBeNull();
  });
});
