import { describe, expect, it } from "vitest";
import { buildVehicleLookup } from "./demoLookup";
import { VEHICLE_ROSTER, vehicleDisplayName } from "./roster";

const OWNER = "Vishal Sharma";

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

  it("keeps the vehicle and date a plate resolved to before chassis numbers existed", () => {
    // The chassis and engine derivations draw from new hash namespaces. If one
    // ever aliased `profile:` or `regdate:`, every bookmarked demo plate would
    // silently resolve to a different car — this is the tripwire for that.
    const lookup = lookupOrThrow("MH01AB1234");
    expect(lookup.profile.id).toBe("mahindra-bolero");
    expect(lookup.registrationDate).toBe("12 Feb 2016");
  });
});

/** ISO 3779 model-year codes as used by `chassisNumberFor`, index 0 = 2010. */
const YEAR_CODES = "ABCDEFGHJKLMNPRSTVWXY123456789";

const WMI: Record<string, string> = {
  "Maruti Suzuki": "MA3",
  Hyundai: "MAL",
  Tata: "MAT",
  Mahindra: "MA1",
  Honda: "MAK",
  Toyota: "MBJ",
};

describe("chassis and engine numbers", () => {
  it("builds a 17-character VIN-shaped chassis with no I, O or Q", () => {
    for (const plate of ["MH01AB1234", "KA05RS1035", "24BH1234AB"]) {
      expect(lookupOrThrow(plate).chassisNumber, plate).toMatch(
        /^[A-HJ-NPR-Z0-9]{17}$/,
      );
    }
  });

  it("opens the chassis with the maker's WMI", () => {
    for (const plate of samplePlates().slice(0, 200)) {
      const lookup = lookupOrThrow(plate);
      expect(lookup.chassisNumber.slice(0, 3), plate).toBe(
        WMI[lookup.profile.maker],
      );
    }
  });

  it("encodes the registration year at VIN position 10", () => {
    for (const plate of samplePlates().slice(0, 200)) {
      const lookup = lookupOrThrow(plate);
      const year = Number(lookup.registrationDate.slice(-4));
      expect(lookup.chassisNumber[9], `${plate} (${year})`).toBe(
        YEAR_CODES[(((year - 2010) % 30) + 30) % 30],
      );
    }
  });

  it("builds an engine number from family, displacement and serial", () => {
    for (const plate of samplePlates().slice(0, 200)) {
      const lookup = lookupOrThrow(plate);
      expect(lookup.engineNumber, plate).toMatch(/^[A-HJ-NPR-Z](?:\d{2}|EV)\d{8}$/);
      // EVs have no displacement, so the middle group is the only fork.
      const capacity = lookup.profile.engineCapacityCc;
      expect(lookup.engineNumber.slice(1, 3), plate).toBe(
        capacity ? String(Math.round(capacity / 100)).padStart(2, "0") : "EV",
      );
    }
  });

  it("is deterministic and independent of how the plate is written", () => {
    const canonical = lookupOrThrow("KA05RS4321");
    for (const variant of [
      "KA05RS4321",
      "ka 05 rs 4321",
      "KA-05-RS-4321",
      "IND KA05RS4321",
    ]) {
      const lookup = lookupOrThrow(variant);
      expect(lookup.chassisNumber, variant).toBe(canonical.chassisNumber);
      expect(lookup.engineNumber, variant).toBe(canonical.engineNumber);
    }
  });

  it("gives every plate its own chassis number", () => {
    // A single hash32 draw only covers about six VIN characters, so slicing one
    // word would collide here long before 3200 plates.
    const plates = samplePlates();
    const chassis = new Set(plates.map((p) => lookupOrThrow(p).chassisNumber));
    expect(chassis.size).toBe(plates.length);
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
