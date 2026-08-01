import { parseRegNumber } from "./regNumber";
import { lookupRto } from "./rtoCodes";
import { VEHICLE_ROSTER } from "./roster";
import type { VehicleLookup } from "./types";

export type VehicleLookupResult =
  | { ok: true; lookup: VehicleLookup }
  | { ok: false; message: string };

/**
 * FNV-1a (32-bit) with a lowbias32 finalizer.
 *
 * A character sum would be shorter, but demo plates differ by a single
 * character far more often than randomly (MH01AB1234 -> MH01AB1235), and a sum
 * maps those to adjacent buckets forever. FNV-1a avalanches: one changed
 * character flips roughly half the output bits. The finalizer is there because
 * FNV-1a's low bits are its weakest and `% length` reads exactly those.
 */
function hash32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    // Math.imul, not `*`: hash * 16777619 exceeds 2^53 and silently loses
    // precision, which is how hand-rolled FNV usually goes wrong in JS.
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d) >>> 0;
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b) >>> 0;
  hash ^= hash >>> 16;
  return hash >>> 0;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** Fixed anchor, never Date.now() — the same plate must survive a rebuild. */
const REG_DATE_START_MS = Date.UTC(2016, 0, 1);
const REG_DATE_WINDOW_DAYS = 3200; // 1 Jan 2016 -> mid-2024

function formatUtc(date: Date): string {
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * Derived from the plate so it is stable, and formatted from an explicit month
 * table rather than toLocaleDateString so every device renders it identically
 * during a demo.
 */
function registrationDateFor(normalized: string, bharatYear?: number): string {
  const offsetDays = hash32(`regdate:${normalized}`) % REG_DATE_WINDOW_DAYS;
  const date = new Date(REG_DATE_START_MS + offsetDays * 86_400_000);

  // A BH plate states its own registration year, so honour it rather than
  // contradicting the number printed on the car.
  if (bharatYear !== undefined) {
    const dayOfYear = hash32(`bhday:${normalized}`) % 365;
    return formatUtc(new Date(Date.UTC(bharatYear, 0, 1 + dayOfYear)));
  }

  return formatUtc(date);
}

/**
 * Map a registration number onto a roster vehicle.
 *
 * Deterministic by design: the same number always yields the same vehicle, so
 * a demo can be repeated and screenshots stay valid. Nothing here contacts a
 * network, and only `location` is genuinely derived from the plate.
 */
export function buildVehicleLookup(
  input: string,
  ownerName: string,
): VehicleLookupResult {
  const parsed = parseRegNumber(input);
  if (!parsed.ok) return { ok: false, message: parsed.message };

  const { normalized } = parsed.value;

  // Hash the canonical form so "mh 01 ab 1234", "MH-01-AB-1234" and
  // "IND MH01AB1234" land on the same vehicle by construction.
  const index = hash32(`profile:${normalized}`) % VEHICLE_ROSTER.length;

  return {
    ok: true,
    lookup: {
      regNumber: parsed.value,
      location: parsed.value.stateCode
        ? lookupRto(parsed.value.stateCode, parsed.value.rtoCode)
        : undefined,
      profile: VEHICLE_ROSTER[index],
      ownerName,
      registrationDate: registrationDateFor(
        normalized,
        parsed.value.bharatYear,
      ),
    },
  };
}
