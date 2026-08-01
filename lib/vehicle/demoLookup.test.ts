import { describe, expect, it } from "vitest";
import { buildVehicleLookup } from "./demoLookup";
import { VEHICLE_ROSTER, vehicleDisplayName } from "./roster";

const OWNER = "Akshay";

function lookupOrThrow(input: string) {
  const result = buildVehicleLookup(input, OWNER);
  if (!result.ok) throw new Error(`expected ${input} to parse: ${result.message}`);
  return result.lookup;
}

/** A broad sweep of realistic plates across states, offices, series and serials. */
function samplePlates(): string[] {
  const states = ["MH", "DL", "KA", "TN", "UP", "GJ", "WB", "RJ", "KL", "PB"];
  const series = ["AB", "CD", "MG", "XY", "AA", "ZZ", "BR", "JK"];
  const plates: string[] = [];
  for (const state of states) {
    for (let office = 1; office <= 40; office += 1) {
      for (const letters of series) {
        plates.push(
          `${state}${String(office).padStart(2, "0")}${letters}${((office * 977 + letters.charCodeAt(0)) % 9000) + 1000}`,
        );
      }
    }
  }
  return plates;
}

describe("buildVehicleLookup", () => {
  it("is deterministic for the same number", () => {
    const a = lookupOrThrow("MH01AB1234");
    const b = lookupOrThrow("MH01AB1234");
    expect(a.profile.id).toBe(b.profile.id);
    expect(a.registrationDate).toBe(b.registrationDate);
  });

  it("ignores spacing, punctuation and the HSRP IND prefix", () => {
    const canonical = lookupOrThrow("MH01AB1234").profile.id;
    for (const variant of [
      "mh 01 ab 1234",
      "MH-01-AB-1234",
      "IND MH01AB1234",
      "  MH01ab1234  ",
    ]) {
      expect(lookupOrThrow(variant).profile.id, variant).toBe(canonical);
    }
  });

  it("decodes the RTO office from the plate", () => {
    const lookup = lookupOrThrow("MH01AB1234");
    expect(lookup.location?.stateName).toBe("Maharashtra");
    expect(lookup.location?.office).toBe("Mumbai (South) — Tardeo");
    expect(lookup.location?.officeKnown).toBe(true);
  });

  it("uses the supplied owner name", () => {
    expect(lookupOrThrow("KA05MG7788").ownerName).toBe(OWNER);
  });

  it("returns a message rather than throwing on an invalid plate", () => {
    for (const bad of ["", "ZZ99ZZ9999", "!!!", "HELLOWORLD"]) {
      const result = buildVehicleLookup(bad, OWNER);
      expect(result.ok, bad).toBe(false);
      if (!result.ok) expect(result.message.length).toBeGreaterThan(0);
    }
  });

  it("honours the year printed on a BH-series plate", () => {
    // A 2016-2024 window date on a 24BH plate would contradict the number itself
    expect(lookupOrThrow("24BH1234AB").registrationDate).toContain("2024");
    expect(lookupOrThrow("22BH5678CD").registrationDate).toContain("2022");
  });

  it("formats the registration date locale-independently", () => {
    expect(lookupOrThrow("MH01AB1234").registrationDate).toMatch(
      /^\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/,
    );
  });
});

describe("roster distribution", () => {
  const plates = samplePlates();

  it("reaches every vehicle in the roster", () => {
    const seen = new Set(plates.map((p) => lookupOrThrow(p).profile.id));
    expect(seen.size).toBe(VEHICLE_ROSTER.length);
  });

  it("spreads plates evenly enough that no vehicle dominates", () => {
    const counts = new Map<string, number>();
    for (const plate of plates) {
      const id = lookupOrThrow(plate).profile.id;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    // Bucket counts are multinomial, so a fixed max/min ratio is really a
    // statement about sample size rather than about the hash. Compare each
    // bucket against its own standard deviation instead: 4 sigma is far outside
    // normal variation but nowhere near tight enough to flake.
    const expected = plates.length / VEHICLE_ROSTER.length;
    const sigma = Math.sqrt(expected * (1 - 1 / VEHICLE_ROSTER.length));

    for (const [id, count] of counts) {
      expect(Math.abs(count - expected), `${id} count=${count}`).toBeLessThan(
        4 * sigma,
      );
    }
  });

  it("keeps neighbouring plates from clustering onto one vehicle", () => {
    // The failure mode a character-sum hash would have: sequential serials
    // walking through adjacent buckets instead of scattering.
    const ids = new Set(
      Array.from({ length: 20 }, (_, i) =>
        lookupOrThrow(`MH01AB${1200 + i}`).profile.id,
      ),
    );
    expect(ids.size).toBeGreaterThan(8);
  });
});

describe("roster data", () => {
  it("has unique ids", () => {
    const ids = new Set(VEHICLE_ROSTER.map((v) => v.id));
    expect(ids.size).toBe(VEHICLE_ROSTER.length);
  });

  it("carries the attribution every Commons licence requires", () => {
    for (const vehicle of VEHICLE_ROSTER) {
      expect(vehicle.imageAuthor, vehicle.id).toBeTruthy();
      expect(vehicle.imageLicense, vehicle.id).toBeTruthy();
      expect(vehicle.imageLicenseUrl, vehicle.id).toMatch(/^https:\/\//);
      expect(vehicle.commonsFile, vehicle.id).not.toMatch(/^File:/);
    }
  });

  it("builds a display name from maker and model", () => {
    expect(vehicleDisplayName(VEHICLE_ROSTER[0])).toBe("Maruti Suzuki Alto 800");
  });
});
