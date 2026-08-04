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

/** The year is returned alongside the text because the chassis encodes it. */
type RegistrationDate = { year: number; formatted: string };

/**
 * Derived from the plate so it is stable, and formatted from an explicit month
 * table rather than toLocaleDateString so every device renders it identically
 * during a demo.
 */
function registrationDateFor(
  normalized: string,
  bharatYear?: number,
): RegistrationDate {
  const offsetDays = hash32(`regdate:${normalized}`) % REG_DATE_WINDOW_DAYS;
  const date = new Date(REG_DATE_START_MS + offsetDays * 86_400_000);

  // A BH plate states its own registration year, so honour it rather than
  // contradicting the number printed on the car.
  if (bharatYear !== undefined) {
    const dayOfYear = hash32(`bhday:${normalized}`) % 365;
    const bhDate = new Date(Date.UTC(bharatYear, 0, 1 + dayOfYear));
    return { year: bhDate.getUTCFullYear(), formatted: formatUtc(bhDate) };
  }

  return { year: date.getUTCFullYear(), formatted: formatUtc(date) };
}

/** VIN alphabet: I, O and Q are excluded so they cannot be read as 1 and 0. */
const VIN_CHARS = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789";
const VIN_LETTERS = "ABCDEFGHJKLMNPRSTUVWXYZ";
const DIGITS = "0123456789";

/** ISO 3779 model-year codes, index 0 = 2010. The table cycles every 30 years. */
const YEAR_CODES = "ABCDEFGHJKLMNPRSTVWXY123456789";

/**
 * Real World Manufacturer Identifiers for the makers in `VEHICLE_ROSTER`.
 * Adding a maker to the roster means adding its WMI here.
 */
const WMI: Record<string, string> = {
  "Maruti Suzuki": "MA3",
  Hyundai: "MAL",
  Tata: "MAT",
  Mahindra: "MA1",
  Honda: "MAK",
  Toyota: "MBJ",
};

/**
 * One independent hash draw per character.
 *
 * A single hash32 yields 32 bits — about six VIN characters — so slicing one
 * word would make later positions correlate with earlier ones. The index is
 * appended after a ":" and plates contain no ":", so no two (seed, index) pairs
 * can concatenate to the same string.
 */
function charsFrom(seed: string, length: number, alphabet: string): string {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += alphabet[hash32(`${seed}:${i}`) % alphabet.length];
  }
  return out;
}

/**
 * Layout mirrors a real VIN: WMI(3) VDS(6) year(1) plant(1) serial(6).
 * Position 9 of a real VIN is a mod-11 check digit; this is demo data and
 * deliberately does not compute one, so a VIN validator will reject it.
 */
function chassisNumberFor(
  normalized: string,
  maker: string,
  year: number,
): string {
  const wmi = WMI[maker] ?? "MA9";
  const vds = charsFrom(`chassis:vds:${normalized}`, 6, VIN_CHARS);
  const yearCode = YEAR_CODES[(((year - 2010) % 30) + 30) % 30];
  const plant = charsFrom(`chassis:plant:${normalized}`, 1, VIN_LETTERS);
  const serial = charsFrom(`chassis:serial:${normalized}`, 6, DIGITS);
  return `${wmi}${vds}${yearCode}${plant}${serial}`;
}

/** Family letter + displacement in hundreds of cc + serial, e.g. "K1245678901". */
function engineNumberFor(normalized: string, capacityCc?: number): string {
  const family = charsFrom(`engine:family:${normalized}`, 1, VIN_LETTERS);
  const displacement = capacityCc
    ? String(Math.round(capacityCc / 100)).padStart(2, "0")
    : "EV";
  const serial = charsFrom(`engine:serial:${normalized}`, 8, DIGITS);
  return `${family}${displacement}${serial}`;
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
  const profile = VEHICLE_ROSTER[index];
  const registrationDate = registrationDateFor(
    normalized,
    parsed.value.bharatYear,
  );

  return {
    ok: true,
    lookup: {
      regNumber: parsed.value,
      location: parsed.value.stateCode
        ? lookupRto(parsed.value.stateCode, parsed.value.rtoCode)
        : undefined,
      profile,
      ownerName,
      registrationDate: registrationDate.formatted,
      chassisNumber: chassisNumberFor(
        normalized,
        profile.maker,
        registrationDate.year,
      ),
      engineNumber: engineNumberFor(normalized, profile.engineCapacityCc),
    },
  };
}
