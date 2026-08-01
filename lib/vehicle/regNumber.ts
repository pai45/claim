import { isKnownStateCode } from "./rtoCodes";
import type {
  ParsedRegNumber,
  RegNumberError,
  RegNumberParseResult,
} from "./types";

/**
 * Indian plate layouts we accept:
 *   standard    MH 01 AB 1234   state + RTO + series + serial
 *   bharat      22 BH 1234 AB   year + BH + serial + series
 *   defence     13 A 123456     leading digits, army/navy/air force
 *   diplomatic  33 CD 1234      mission code + CD/UN + serial
 */
const STANDARD = /^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$/;
const BHARAT = /^(\d{2})BH(\d{4})([A-Z]{1,2})$/;
const DEFENCE = /^(\d{2})([A-Z])(\d{6})([A-Z]?)$/;
const DIPLOMATIC = /^(\d{1,3})(CD|CC|UN)(\d{1,4})$/;

const MIN_LENGTH = 5;
const MAX_LENGTH = 11;

/** Strip separators, decorative prefixes, and case. */
export function normalizeRegNumber(input: string): string {
  return input
    .toUpperCase()
    .replace(/[\s.\-–—_/\\|]/g, "")
    // "IND" band printed on HSRP plates
    .replace(/^IND/, "")
    .replace(/[^A-Z0-9]/g, "");
}

function group(parsed: Omit<ParsedRegNumber, "formatted">): string {
  switch (parsed.format) {
    case "standard":
      return [parsed.stateCode, parsed.rtoCode, parsed.series, parsed.serial]
        .filter(Boolean)
        .join(" ");
    case "bharat":
      return `${parsed.bharatYear ? String(parsed.bharatYear).slice(-2) : ""} BH ${parsed.serial} ${parsed.series}`.trim();
    default:
      return parsed.normalized;
  }
}

function fail(error: RegNumberError, message: string): RegNumberParseResult {
  return { ok: false, error, message };
}

export function parseRegNumber(input: string): RegNumberParseResult {
  const normalized = normalizeRegNumber(input ?? "");

  if (!normalized) {
    return fail("empty", "Enter a vehicle number to continue.");
  }
  if (normalized.length < MIN_LENGTH) {
    return fail("too_short", "That looks too short for a vehicle number.");
  }
  if (normalized.length > MAX_LENGTH) {
    return fail("too_long", "That looks too long for a vehicle number.");
  }

  const bharat = normalized.match(BHARAT);
  if (bharat) {
    const yy = Number(bharat[1]);
    const value: Omit<ParsedRegNumber, "formatted"> = {
      normalized,
      format: "bharat",
      series: bharat[3],
      serial: bharat[2],
      bharatYear: yy + (yy > 50 ? 1900 : 2000),
    };
    return { ok: true, value: { ...value, formatted: group(value) } };
  }

  const diplomatic = normalized.match(DIPLOMATIC);
  if (diplomatic) {
    const value: Omit<ParsedRegNumber, "formatted"> = {
      normalized,
      format: "diplomatic",
      serial: diplomatic[3],
    };
    return { ok: true, value: { ...value, formatted: group(value) } };
  }

  const defence = normalized.match(DEFENCE);
  if (defence) {
    const value: Omit<ParsedRegNumber, "formatted"> = {
      normalized,
      format: "defence",
      serial: defence[3],
    };
    return { ok: true, value: { ...value, formatted: group(value) } };
  }

  const standard = normalized.match(STANDARD);
  if (standard) {
    const stateCode = standard[1];
    if (!isKnownStateCode(stateCode)) {
      return fail(
        "unknown_state",
        `"${stateCode}" isn't a state code we recognise. Check the first two letters.`,
      );
    }
    const value: Omit<ParsedRegNumber, "formatted"> = {
      normalized,
      format: "standard",
      stateCode,
      // Single-digit RTO codes are written with a leading zero on the plate
      rtoCode: standard[2].padStart(2, "0"),
      series: standard[3] || undefined,
      serial: standard[4],
    };
    return { ok: true, value: { ...value, formatted: group(value) } };
  }

  return fail(
    "unrecognized_format",
    "That doesn't look like a vehicle number. Try something like MH 01 AB 1234.",
  );
}

/** Live formatter for a text input — groups as the user types. */
export function formatRegNumberInput(input: string): string {
  const raw = normalizeRegNumber(input).slice(0, MAX_LENGTH);
  const match = raw.match(/^([A-Z]{0,2})(\d{0,2})([A-Z]{0,3})(\d{0,4})$/);
  if (!match) return raw;
  return match.slice(1).filter(Boolean).join(" ");
}
