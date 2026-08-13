import { describe, expect, it } from "vitest";
import {
  DEMO_NEARBY_MEAL_MERCHANTS,
  DEMO_NEARBY_MEAL_SEARCH_DELAY_MS,
} from "./demoNearby";

describe("nearby meal merchant demo", () => {
  it("waits five seconds before revealing results", () => {
    expect(DEMO_NEARBY_MEAL_SEARCH_DELAY_MS).toBe(5_000);
  });

  it("provides five unique, allowed merchants ordered by distance", () => {
    expect(DEMO_NEARBY_MEAL_MERCHANTS).toHaveLength(5);
    expect(
      new Set(DEMO_NEARBY_MEAL_MERCHANTS.map((merchant) => merchant.id)).size,
    ).toBe(5);
    expect(
      DEMO_NEARBY_MEAL_MERCHANTS.every(
        (merchant) => merchant.allowed && merchant.placeTypes.length > 0,
      ),
    ).toBe(true);

    const distances = DEMO_NEARBY_MEAL_MERCHANTS.map(
      (merchant) => merchant.distanceMeters,
    );
    expect(distances).toEqual([320, 650, 1_100, 1_600, 2_400]);
  });
});
