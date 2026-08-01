import { isKnownStateCode } from "@/lib/vehicle/rtoCodes";

export type ParsedDlFields = {
  dlNumber?: string;
  warning?: string;
};

/** Strip separators and OCR noise; keep A–Z / 0–9 only. */
export function normalizeDlText(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDlNumber(state: string, rto: string, year: string, serial: string) {
  return `${state}${rto} ${year}${serial}`;
}

/**
 * Common Indian DL layouts after normalization:
 *   MH01 20110012345  /  MH0120110012345  → state + RTO + year + 7-digit serial
 */
const SPACED = /\b([A-Z]{2})\s*(\d{2})\s*(\d{4})\s*(\d{7})\b/g;
const COMPACT = /\b([A-Z]{2})(\d{2})(\d{4})(\d{7})\b/g;

function tryMatch(
  text: string,
  pattern: RegExp,
): { dlNumber: string; state: string } | null {
  pattern.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const state = match[1];
    if (!isKnownStateCode(state)) continue;
    return {
      state,
      dlNumber: formatDlNumber(state, match[2], match[3], match[4]),
    };
  }
  return null;
}

export function parseDl(rawText: string): ParsedDlFields {
  if (!rawText?.trim()) return {};

  const normalized = normalizeDlText(rawText);
  const compact = normalized.replace(/\s+/g, "");

  const fromSpaced = tryMatch(normalized, SPACED);
  if (fromSpaced) return { dlNumber: fromSpaced.dlNumber };

  const fromCompact = tryMatch(compact, COMPACT);
  if (fromCompact) return { dlNumber: fromCompact.dlNumber };

  return {
    warning:
      "I couldn't find a driving licence number. Please enter it manually.",
  };
}
